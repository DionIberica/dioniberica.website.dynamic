var juice = require('juice');
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});
var webmaster_email = process.env.WEBMASTER_EMAIL;

function renderCheckoutEmail(app, checkoutData) {
  return new Promise((fulfill, reject) => {
    app.render('preview', checkoutData, (err, html) => {
      if(err) {
        reject(err);
      }

      var styleHtml = juice(html);

      fulfill(styleHtml);
    });
  });
}

function sendEmail(app, checkoutData, html) {
  var locale = checkoutData.locale;
  var email = checkoutData.email;
  var by = checkoutData.i18n.__('mail.sender');
  var by = process.env['SHOP_' + locale.toUpperCase() + '_EMAIL']);

  return new Promise((fulfill, reject) => {
    var data = {
      from: 'Dion Iberica <' + by + '>',
      to: email,
      bcc: [webmaster_email, by].join(','),
      subject: checkoutData.i18n.__('mail.title') + ', ' + checkoutData.charge.source.name,
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
