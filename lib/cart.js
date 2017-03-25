var prices = require('../prices.json');

var Cart = function(session, default_items, max_items, locale) {
  this.session = session;
  this.max_items = max_items;

  this.items = session.items || default_items;
  this.coupon = session.coupon;
  this.locale = locale;

  this.price = prices[locale].price;
};

Cart.prototype.compute = function() {
  return this.items * this.price;
};

Cart.prototype.add = function() {
  this.items = Math.min(this.items + 1, this.max_items);
};

Cart.prototype.subtract = function() {
  this.items = Math.max(this.items - 1, 0);
};

Cart.prototype.setCoupon = function(coupon) {
  this.coupon = coupon; // TODO: Validate
};

Cart.prototype.setEmail = function(email) {
  this.email = email;
};

Cart.prototype.save = function() {
  this.session.locale = this.locale;
  this.session.items = this.items;
  this.session.coupon = this.coupon;
  this.session.email = this.email;
};

Cart.prototype.toJSON = function() {
  return {
    items: this.items,
    price: this.price,
    coupon: this.coupon,
    amount: this.compute(),
    email: this.email,
  }
};

module.exports = Cart;
