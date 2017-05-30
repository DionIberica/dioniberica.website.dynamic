const juice = require('juice');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

function renderCheckoutEmail(app, checkoutData) {
  return new Promise((fulfill, reject) => {
    app.render('preview', checkoutData, (err, html) => {
      if (err) {
        reject(err);
      }

      const styleHtml = juice(html);

      fulfill(styleHtml);
    });
  });
}

function sendEmail(app, checkoutData, html) {
  const email = checkoutData.email;
  const by = checkoutData.i18n.__('mail.sender');

  return new Promise((fulfill, reject) => {
    const data = {
      from: `Dion Iberica <${by}>`,
      to: email,
      bcc: `fcsonline@gmail.com, ${by}`,
      subject: checkoutData.i18n.__('mail.title') + ', ' + checkoutData.charge.source.name,
      html,
    };

    mailgun.messages().send(data, (err, _body) => {
      if (err) {
        reject(err);
      }

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
