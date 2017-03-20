var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Raven = require('raven');

// Raven.config(process.env.RAVEN_DSN || 'lol').install();

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
  secret: 'test',
  // store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
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
