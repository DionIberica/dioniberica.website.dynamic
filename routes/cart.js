const express = require('express');
const Raven = require('raven');
const Stripe = require('stripe');
const Cart = require('../lib/cart');
const sendCheckoutEmail = require('../lib/emails/checkout');

const router = express.Router();

router.all('*', (req, res, next) => {
  const locale = (req.query.locale || req.body.locale || req.session.locale).split('_')[0];
  const envName = (req.app.get('env') === 'development' ? 'TEST_' : '') + 'STRIPE';

  req.cart = new Cart(Stripe(process.env[envName]), req.session, 1, 100, locale);

  next();
});

router.get('/', (req, res, next) => {
  req.cart.retrieve().then(() => {
    next();
  });
});

router.post('/quantity', (req, res, next) => {
  req.cart.setQuantity(req.body.quantity).then(() => {
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

    req.cart.setPreviousOrder(results.order);
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
    const amount = (req.cart.amount / 100).toFixed(2);
    const transaction = results.charge.description;

    res.redirect(success + '?amount=' + amount + '&transaction=' + transaction);
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
