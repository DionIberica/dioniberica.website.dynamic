const express = require('express');
const Raven = require('raven');
const Cart = require('../lib/cart');
const sendCheckoutEmail = require('../lib/emails/checkout');

const router = express.Router();

router.all('*', (req, res, next) => {
  const locale = req.query.locale || req.body.locale;
  const stripe = req.app.get('stripe')(locale);

  req.cart = new Cart(stripe, req.session, 1, 100, locale);

  next();
});

router.get('/', (req, res, next) => {
  req.cart.retrieve().then(() => {
    next();
  });
});

router.post('/add', (req, res, next) => {
  req.cart.add().then(() => {
    next();
  });
});

router.post('/subtract', (req, res, next) => {
  req.cart.subtract().then(() => {
    next();
  });
});

router.post('/coupon', (req, res, next) => {
  req.cart.setCoupon(req.body.coupon).then(() => {
    next();
  });
});

router.post('/checkout', (req, res) => {
  const success = req.body.success;
  const failure = req.body.failure;
  const stripe = req.cart.stripe;

  const email = req.body.stripeEmail;
  const token = req.body.stripeToken;
  const results = {};

  req.i18n.setLocale(req.cart.locale);
  req.cart.setEmail(email);

  return stripe.orders.pay(req.cart.orderId, {
    source: token,
    email,
  }).then((order) => {
    results.order = order;

    return stripe.charges.retrieve(order.charge);
  }).then((charge) => {
    results.charge = charge;

    const order = results.order;
    const source = charge.source;

    return stripe.orders.update(order.id, {
      shipping: {
        name: source.name,
        address: {
          line1: source.address_line1,
          city: source.address_city,
          country: source.address_country,
          postal_code: source.address_zip,
        },
      },
    });
  }).then((order) => {
    req.cart.setPreviousOrder(order);
    req.cart.reset();
    req.cart.save();

    return sendCheckoutEmail(req.app, {
      email,
      cart: req.cart.toJSON(),
      charge: results.charge,
      i18n: req.i18n,
    });
  })
  .then(() => {
    res.redirect(success);
  })
  .catch((reason) => {
    Raven.captureException(reason);

    res.redirect(failure);
  });
});

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
