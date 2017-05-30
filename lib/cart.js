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

  if (this.order_id) {
    this.retrieve();
  } else {
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
  }, (err, order) => {
      if(err) {
        console.log(err);
        return;
      }

      this.order_id = order.id;
  });
};

Cart.prototype.retreive = function() {
  return stripe.orders.retreive(this.order_id, (err, order) => {
      if(err) {
        console.log(err);
        return;
      }

      this.order = order;
  });
};

Cart.prototype.compute = function() {
  const sku = this.order.items.find((item) => item.type === 'sku')

  return sku ? tax.amount : 0;
};

Cart.prototype.taxes = function() {
  const tax = this.order.items.find((item) => item.type === 'tax')

  return tax ? tax.amount : 0;
};

Cart.prototype.discount = function() {
  const discount = this.order.items.find((item) => item.type === 'discount')

  return discount ? discount.amount : 0;
};

Cart.prototype.coupon = function() {
  const discount = this.order.items.find((item) => item.type === 'discount')

  return discount && discount.parent;
};

Cart.prototype.add = function() {
  const items = this.order.items.find((item) => item.type === 'sku')

  return stripe.orders.update(this.order_id, {
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: Math.min(items.quantity + 1, this.max_items);
      }
    ]
  }, (err, order) => {
      if(err) {
        console.log(err);
        return;
      }

      this.order = order;
  });
};

Cart.prototype.subtract = function() {
  this.items = Math.max(this.items - 1, this.min_items);

  const items = this.order.items.find((item) => item.type === 'sku')

  return stripe.orders.update(this.order_id, {
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: Math.max(items.quantity - 1, this.min_items)
      }
    ]
  }, (err, order) => {
      if(err) {
        console.log(err);
        return;
      }

      this.order = order;
  });
};

Cart.prototype.setPreviousOrder = function(order) {
  this.order = order;
};

Cart.prototype.setCoupon = function(coupon) {
  this.coupon = coupon; // TODO: Validate
  return stripe.orders.update(this.order_id, {
    coupon: coupon,
  }, (err, order) => {
      if(err) {
        console.log(err);
        return;
      }

      this.order = order;
  });
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
  var discount = this.discount();

  return {
    items: this.items,
    price: this.price,
    taxes: taxes,
    coupon: this.coupon,
    discount: discount,
    subtotal: subtotal,
    amount: subtotal + taxes,
    email: this.email,
  }
};

module.exports = Cart;
