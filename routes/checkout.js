var express = require('express');
var router = express.Router();
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var info_email = process.env.INFO_EMAIL;
var webmaster_email = process.env.WEBMASTER_EMAIL;
var coupons = require('./coupons');
var Paypal = require('paypal-express-checkout');
var paypal = Paypal.init(
  process.env.PAYPAL_USERNAME || 'fcsonline-facilitator_api1.gmail.com',
  process.env.PAYPAL_PASSWORD || '1393002041',
  process.env.PAYPAL_SIGNATURE || 'ASMPz-e7o8DMcd3tPmgRSgHkkxbaARmJ5CLB90OyQ3HXjpjbpf0XMIZS',
  'http://www.example.com/return',
  'http://www.example.com/cancel',
  true
);

router.get('/pay', function(req, res) {

  paypal.pay('20130001', 123.23, 'iPad', 'EUR', true, function(err, url) {
    if (err) {
      console.log(err);
      return;
    }

    // redirect to paypal webpage 
    response.redirect(url);
  });
  // if (!req.body) {
  //   res.sendStatus(409);
  //   return;
  // }

  // req.app.render('contact', req.body, function(err, html) {
  //   if (err) {
  //     res.sendStatus(409);
  //     return;
  //   }

  //   var data = {
  //     from: req.body.name + ' <' + req.body.email + '>',
  //     to: info_email,
  //     bcc: webmaster_email,
  //     subject: req.body.subject,
  //     html: html
  //   };

  //   mailgun.messages().send(data, function (err, body) {
  //     if (err) {
  //       res.sendStatus(409);
  //       return;
  //     }

  //     res.json({});
  //   });
  // });
  
});

// paypal.detail('EC-788441863R616634K', '9TM892TKTDWCE', function(err, data, invoiceNumber, price) {
//   if (err) {
//     console.log(err);
//     return;
//   }
// 
//   // data.success == {Boolean} 
// 
//   if (data.success)
//     console.log('DONE, PAYMENT IS COMPLETED.');
//   else
//     console.log('SOME PROBLEM:', data);
// 
//   /*
//      data (object) =
//      { TOKEN: 'EC-35S39602J3144082X',
//      TIMESTAMP: '2013-01-27T08:47:50Z',
//      CORRELATIONID: 'e51b76c4b3dc1',
//      ACK: 'Success',
//      VERSION: '52.0',
//      BUILD: '4181146',
//      TRANSACTIONID: '87S10228Y4778651P',
//      TRANSACTIONTYPE: 'expresscheckout',
//      PAYMENTTYPE: 'instant',
//      ORDERTIME: '2013-01-27T08:47:49Z',
//      AMT: '10.00',
//      TAXAMT: '0.00',
//      CURRENCYCODE: 'EUR',
//      PAYMENTSTATUS: 'Pending',
//      PENDINGREASON: 'multicurrency',
//      REASONCODE: 'None' };
//      */
// });

module.exports = router;
