var express = require('express');
var router = express.Router();
var Raven = require('raven');
var stripe = require('stripe')('sk_test_XCQ8tR2I83v6UnxXS4yTAtjP');
var Cart = require('../lib/cart');

router.all('*', (req, res, next) => {
  req.cart = new Cart(req.session, 1, 100);
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
  var token = req.body.stripeToken;

  req.cart.setToken(req.body.stripeToken);
  req.cart.setEmail(req.body.stripeEmail);

  stripe.charges.retrieve(token, (err, charge) => {
    res.json(charge);
  });
});

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
