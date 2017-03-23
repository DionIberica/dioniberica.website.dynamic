var express = require('express');
var router = express.Router();
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var info_email = process.env.INFO_EMAIL;
var webmaster_email = process.env.WEBMASTER_EMAIL;

router.get('/preview', function(req, res) {
  var key = process.env['STRIPE_EN'];
  var stripe = require('stripe')(key);

  stripe.charges.retrieve("ch_1A0eqlHgbV9vBiCll57e7Qnq", function(err, charge) {
    res.app.render('preview', charge, function(err, html){
      if(err) console.log(err);

      res.status(200).send(html);
    });
  });
});

module.exports = router;
