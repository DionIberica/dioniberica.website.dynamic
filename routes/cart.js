const express = require('express');
const Raven = require('raven');
const Cart = require('../lib/cart');
const sendCheckoutEmail = require('../lib/emails/checkout');

const router = express.Router();

router.all('*', (req, res, next) => {
  const locale = req.query.locale;
  const stripe = req.app.get('stripe')(locale);

  req.cart = new Cart(stripe, req.session, 1, 100, locale);

  next();
});

router.get('/', (req, res, next) => {
  next();
});

router.post('/add', (req, res, next) => {
  req.cart.add();

  next();
});

router.post('/subtract', (req, res, next) => {
  req.cart.subtract();

  next();
});

router.post('/coupon', (req, res, next) => {
  req.cart.setCoupon(req.body.coupon);

  next();
});

router.post('/checkout', (req, res) => {
  const cart = req.cart.toJSON();
  const locale = req.body.locale;
  const success = req.body.success;
  const failure = req.body.failure;
  const stripe = cart.stripe;

  const email = req.body.stripeEmail;
  const token = req.body.stripeToken;
  const results = {};

  req.i18n.setLocale(locale);
  req.cart.setEmail(email);

  stripe.customers.create({
    email,
  }).then(() => {
    return stripe.charges.create({
      amount: (req.cart.compute() + req.cart.taxes()),
      currency: 'eur',
      description: 'Dion Iberica',
      metadata: { order_id: 6735 },
      source: token,
    });
  }).then((charge) => {
    results.charge = charge;

    const source = charge.source;

    return stripe.orders.create({
      currency: 'eur',
      items: [
        {
          type: 'sku',
          parent: 'sku_1',
          amount: cart.price,
          quantity: cart.items,
        },
      ],
      shipping: {
        name: source.name,
        address: {
          line1: source.address_line1,
          city: source.address_city,
          country: source.address_country,
          postal_code: source.address_zip,
        },
      },
      email,
    });
  }).then((order) => {
    req.cart.setPreviousOrder(order);
    req.cart.reset();
    req.cart.save();

    return sendCheckoutEmail(req.app, {
      email,
      cart,
      charge: results.charge,
      i18n: req.i18n,
    });
  }).then((_charge) => {
    res.redirect(success);
  }).catch((reason) => {
    Raven.captureException(reason);

    res.redirect(failure);
  });
});

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
