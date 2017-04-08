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

function sendEmail(app, checkoutData, html) {
  var email = checkoutData.email;
  var by = checkoutData.i18n.__('mail.sender');

  return new Promise((fulfill, reject) => {
    var data = {
      from: 'Dion Iberica <' + by + '>',
      to: email,
      bcc: 'fcsonline@gmail.com',
      subject: checkoutData.i18n.__('mail.title'),
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
    return sendEmail(app, checkoutData, html);
  });
}

module.exports = sendCheckoutEmail;
