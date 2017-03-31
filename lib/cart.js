var prices = require('../prices.json');

var Cart = function(session, min_items, max_items, locale) {
  this.session = session;
  this.min_items = min_items;
  this.max_items = max_items;

  this.items = session.items || min_items;
  this.coupon = session.coupon;
  this.locale = locale || this.session.locale;

  this.price = prices[this.locale].price;
  this.tax = prices[this.locale].tax;
};

Cart.prototype.compute = function() {
  return this.items * this.price * (1 + this.tax);
};

Cart.prototype.add = function() {
  this.items = Math.min(this.items + 1, this.max_items);
};

Cart.prototype.subtract = function() {
  this.items = Math.max(this.items - 1, this.min_items);
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
