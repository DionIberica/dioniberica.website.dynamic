var express = require('express');
var router = express.Router();
var Raven = require('raven');
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

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
