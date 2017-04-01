var express = require('express');
var router = express.Router();
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var info_email = process.env.INFO_EMAIL;
var webmaster_email = process.env.WEBMASTER_EMAIL;

router.get('/preview', function(req, res) {
  var stripe = req.app.get('stripe')('en');

  stripe.charges.retrieve("ch_1A3KbUHgbV9vBiClmu9ftgQW", function(err, charge) {
    const data = {
      charge: charge,
      cart: {}
    };

    res.app.render('preview', data, function(err, html){
      if(err) console.log(err);

      res.status(200).send(html);
    });
  });
});

module.exports = router;
