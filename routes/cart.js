var express = require('express');
var router = express.Router();
var Raven = require('raven');

const MAX_ITEMS = 100;

function getCurrentItems(req) {
  return req.session.items || 0;
}

router.get('/', (req, res, next) => {
  req.session.items = getCurrentItems(req);

  next();
});

router.post('/add', (req, res, next) => {
  req.session.items = Math.min(getCurrentItems(req) + 1, MAX_ITEMS);

  next();
});

router.post('/subtract', (req, res, next) => {
  req.session.items = Math.max(getCurrentItems(req) - 1, 0);

  next();
});

router.all('*', (req, res) => {
  res.json({
    items: getCurrentItems(req)
  });
});

module.exports = router;
