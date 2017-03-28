var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

function renderCheckoutEmail(app, checkoutData) {
  return new Promise((fulfill, reject) => {
    app.render('preview', checkoutData, (err, html) => {
      if(err) {
        reject(err);
      }

      fulfill(html);
    });
  });
}

function sendEmail(email, checkoutData, html) {
  return new Promise((fulfill, reject) => {
    var data = {
      from: 'Test compra '+ ' <' + email + '>',
      to: email,
      subject: 'Compra!',
      html: html
    };

    mailgun.messages().send(data, function (err, body) {
      if(err) {
        reject(err)
      };

      fulfill();
    });
  });
}

function sendCheckoutEmail(app, checkoutData) {
  return renderCheckoutEmail(app, checkoutData).then((html) => {
    return sendEmail(checkoutData.email, checkoutData, html);
  });
}

module.exports = sendCheckoutEmail;
