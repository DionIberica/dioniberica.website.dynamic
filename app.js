var express = require('express');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redis = require('redis');
var client = redis.createClient();
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Raven = require('raven');
var i18n = require('i18n-2');
var yaml = require('js-yaml');
var fs = require('fs');
var locales= {};

Raven.config(process.env.RAVEN_DSN || '').install();

var contact = require('./routes/contact');
var ping = require('./routes/ping');
var checkout = require('./routes/checkout');
var cart = require('./routes/cart');

var app = express();

app.use(Raven.requestHandler());
app.use(Raven.errorHandler());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.REDIS_SECRET_KEY,
  store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl: 260}),
  saveUninitialized: false,
  resave: false,
  cookie: {
    // secure: true,
    // httpOnly: true,
  }
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Loading locales
fs.readdirSync(__dirname + '/locales').forEach((file) => {
  var locale = yaml.safeLoad(fs.readFileSync(__dirname + '/locales/' + file, 'utf8'));

  Object.assign(locales, locale);
});

i18n.expressBind(app, {
  locales: locales,
  defaultLocale: 'es',
});

app.use('/contact', contact);
app.use('/ping', ping);
app.use('/checkout', checkout);
app.use('/cart', cart);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('stripe', (locale) => {
  var stripe = require('stripe');

  if (app.get('env') === 'development') {
    return stripe(process.env['TEST_STRIPE']);
  } else {
    return stripe(process.env['STRIPE_' + locale.toUpperCase()]);
  }
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
