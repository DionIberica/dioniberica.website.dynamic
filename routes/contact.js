var express = require('express');
var router = express.Router();
var domain = 'dioniberica.com';
var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: domain});

router.post('/support', function(req, res) {

  if (!req.body) {
    res.sendStatus(409);
    return;
  }

  req.app.render('contact', req.body, function(err, html) {
    if (err) {
      res.sendStatus(409);
      return;
    }

    var data = {
      from: req.body.name + ' <' + req.body.email + '>',
      to: 'info@dioniberica.com',
      bcc: 'fcsonline@gmail.com',
      subject: req.body.subject,
      html: html
    };

    mailgun.messages().send(data, function (err, body) {
      if (err) {
        res.sendStatus(409);
        return;
      }

      res.json({});
    });
  });
  
});

module.exports = router;
