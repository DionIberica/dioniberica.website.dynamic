var express = require('express');
var router = express.Router();
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var info_email = process.env.INFO_EMAIL;
var webmaster_email = process.env.WEBMASTER_EMAIL;
var Raven = require('raven');

router.post('/support', function(req, res) {

  if (!req.body) {
    Raven.captureMessage('Invalid request body')
    res.status(409).send('Invalid request body');
    return;
  }

  req.app.render('contact', req.body, function(err, html) {
    if (err) {
      Raven.captureMessage('Invalid render')
      res.status(409).send('Invalid render');
      return;
    }

    var data = {
      from: req.body.name + ' <' + req.body.email + '>',
      to: info_email,
      bcc: webmaster_email,
      subject: req.body.subject,
      html: html
    };

    mailgun.messages().send(data, function (err, body) {
      if (err) {
        Raven.captureMessage('Invalid email')
        res.status(409).send('Invalid email');
        return;
      }

      res.json({});
    });
  });

});

module.exports = router;
