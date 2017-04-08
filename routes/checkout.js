var express = require('express');
var router = express.Router();
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var info_email = process.env.INFO_EMAIL;
var webmaster_email = process.env.WEBMASTER_EMAIL;
var juice = require('juice');

router.get('/preview', function(req, res) {
  req.i18n.setLocale('pt');

  throw new Error('WAT');

  var stripe = req.app.get('stripe')('en');

  stripe.charges.retrieve("ch_1A3KbUHgbV9vBiClmu9ftgQW", function(err, charge) {
    const data = {
      charge: charge,
      cart: {
        items: 2,
        price: 500,
        taxes: 100,
        subtotal: 1000,
        amount: 1100,
        email: 'fcsonline@gmail.com',
      },
      i18n: req.i18n
    };

    res.app.render('preview', data, function(err, html){
      if(err) console.log(err);

      var styleHtml = juice(html);

      res.status(200).send(styleHtml);
    });
  });
});

module.exports = router;
