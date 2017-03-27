var express = require('express');
var router = express.Router();
var Raven = require('raven');
var Cart = require('../lib/cart');

router.all('*', (req, res, next) => {
  var locale = req.query.locale;

  req.cart = new Cart(req.session, 1, 100, locale);

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
  var locale = req.body.locale;
  var success = req.body.success;
  var failure = req.body.failure;

  var key = process.env['STRIPE_' + locale.toUpperCase()];
  var stripe = require('stripe')(key);

  var email = req.body.stripeEmail;
  var token = req.body.stripeToken;

  req.cart.setEmail(email);

  stripe.customers.create({
    email: email
  }).then(() => {
    return  stripe.charges.create({
      amount: req.cart.compute(),
      currency: "eur",
      description: "Dion Iberica",
      metadata: {order_id: 6735},
      source: token,
    });
  }).then((charge) => {
    res.json({
      email: email,
      charge: charge,
    });
    res.redirect(success);
  }).catch((reason) => {
    res.redirect(failure);
  });
});

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
