var express = require('express');
var router = express.Router();
var Raven = require('raven');
var Cart = require('../lib/cart');
var sendCheckoutEmail = require('../lib/emails/checkout');

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
  var cart = req.cart.toJSON();
  var locale = req.body.locale;
  var success = req.body.success;
  var failure = req.body.failure;
  var stripe = req.app.get('stripe')(locale);

  var email = req.body.stripeEmail;
  var token = req.body.stripeToken;
  var results = {};

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
    results.charge = charge;

    var source = charge.source;

    return stripe.orders.create({
      currency: 'eur',
      items: [
        {
          type: 'sku',
          parent: 'sku_1',
          amount: cart.price,
          quantity: cart.items,
        }
      ],
      shipping: {
        name: source.name,
        address: {
          line1: source.address_line1,
          city: source.address_city,
          country: source.address_country,
          postal_code: source.address_zip
        }
      },
      email: email
    });
  }).then((order) => {
    return sendCheckoutEmail(req.app, {
      email: email,
      charge: results.charge,
      cart: cart,
      i18n: req.i18n
    });
  }).then((charge) => {
    res.redirect(success);
  }).catch((reason) => {
    console.log(reason);
    res.redirect(failure);
  });
});

router.all('*', (req, res) => {
  req.cart.save();

  res.json(req.cart.toJSON());
});

module.exports = router;
