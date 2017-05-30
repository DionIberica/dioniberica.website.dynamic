var prices = require('../prices.json');

var Cart = function(session, min_items, max_items, locale) {
  this.session = session;
  this.min_items = min_items;
  this.max_items = max_items;

  this.order_id = session.order_id;
  this.order = session.order;
  this.items = session.items || min_items;
  this.coupon = session.coupon;
  this.locale = (locale || this.session.locale).split('_')[0];

  this.price = prices[this.locale].price;
  this.tax = prices[this.locale].tax;

  if (!this.order_id) {
    this.create();
  }
};

Cart.prototype.create = function() {
  return stripe.orders.create({
    currency: 'eur',
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: 1,
      }
    ],
  } => (err, order) {
      if(err) {
        console.log(err);
        return;
      }

      this.order_id = order.id;
  });
};

Cart.prototype.compute = function() {
  return this.items * this.price;
};

Cart.prototype.taxes = function() {
  return this.items * this.price * (this.tax);
};

Cart.prototype.add = function() {
  this.items = Math.min(this.items + 1, this.max_items);
};

Cart.prototype.subtract = function() {
  this.items = Math.max(this.items - 1, this.min_items);
};

Cart.prototype.setPreviousOrder = function(order) {
  this.order = order;
};

Cart.prototype.setCoupon = function(coupon) {
  this.coupon = coupon; // TODO: Validate
};

Cart.prototype.setEmail = function(email) {
  this.email = email;
};

Cart.prototype.reset = function() {
  this.items = this.min_items;
  this.coupon = null;
};

Cart.prototype.save = function() {
  this.session.locale = this.locale;
  this.session.items = this.items;
  this.session.coupon = this.coupon;
  this.session.email = this.email;
  this.session.order = this.order;
  this.session.order_id = this.order_id;
};

Cart.prototype.toJSON = function() {
  var subtotal = this.compute();
  var taxes = this.taxes();

  return {
    items: this.items,
    price: this.price,
    taxes: taxes,
    coupon: this.coupon,
    subtotal: subtotal,
    amount: subtotal + taxes,
    email: this.email,
  }
};

module.exports = Cart;
