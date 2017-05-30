const prices = require('../prices.json');

const Cart = (stripe, session, minItems, maxItems, locale) => {
  this.session = session;
  this.minItems = minItems;
  this.maxItems = maxItems;

  this.stripe = stripe;
  this.orderId = session.orderId;
  this.order = session.order;
  this.items = session.items || minItems;
  this.coupon = session.coupon;
  this.locale = (locale || this.session.locale).split('_')[0];

  this.price = prices[this.locale].price;
  this.tax = prices[this.locale].tax;

  if (this.orderId) {
    this.retrieve();
  } else {
    this.create();
  }
};

Cart.prototype.create = () => {
  return this.stripe.orders.create({
    currency: 'eur',
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: 1,
      },
    ],
  }, (err, order) => {
    if (err) {
      console.log(err);
      return;
    }

    this.orderId = order.id;
  });
};

Cart.prototype.retreive = () => {
  return this.stripe.orders.retreive(this.orderId, (err, order) => {
    if (err) {
      console.log(err);
      return;
    }

    this.order = order;
  });
};

Cart.prototype.compute = () => {
  const sku = this.order.items.find(item => item.type === 'sku');

  return sku ? tax.amount : 0;
};

Cart.prototype.taxes = () => {
  const tax = this.order.items.find(item => item.type === 'tax');

  return tax ? tax.amount : 0;
};

Cart.prototype.discount = () => {
  const discount = this.order.items.find(item => item.type === 'discount');

  return discount ? discount.amount : 0;
};

Cart.prototype.coupon = () => {
  const discount = this.order.items.find(item => item.type === 'discount');

  return discount && discount.parent;
};

Cart.prototype.items = () => {
  const items = this.order.items.find(item => item.type === 'sku');

  return items && items.quantity;
};

Cart.prototype.price = () => {
  const items = this.order.items.find(item => item.type === 'sku');

  return items && items.amount;
};

Cart.prototype.add = () => {
  return this.stripe.orders.update(this.orderId, {
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: Math.min(this.items() + 1, this.maxItems),
      },
    ],
  }, (err, order) => {
    if (err) {
      console.log(err);
      return;
    }

    this.order = order;
  });
};

Cart.prototype.subtract = () => {
  return this.stripe.orders.update(this.orderId, {
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: Math.max(this.items() - 1, this.minItems),
      },
    ],
  }, (err, order) => {
    if (err) {
      console.log(err);
      return;
    }

    this.order = order;
  });
};

Cart.prototype.setPreviousOrder = (order) => {
  this.order = order;
};

Cart.prototype.setCoupon = (coupon) => {
  this.coupon = coupon; // TODO: Validate
  return this.stripe.orders.update(this.orderId, {
    coupon,
  }, (err, order) => {
    if (err) {
      console.log(err);
      return;
    }

    this.order = order;
  });
};

Cart.prototype.setEmail = (email) => {
  this.email = email;
};

Cart.prototype.reset = () => {
  // TODO
  this.items = this.minItems;
  this.coupon = null;
};

Cart.prototype.save = () => {
  this.session.locale = this.locale;
  this.session.email = this.email;
  this.session.orderId = this.orderId;

  // this.session.items = this.items;
  // this.session.coupon = this.coupon;
  // this.session.order = this.order;
};

Cart.prototype.toJSON = () => {
  const subtotal = this.compute();

  return {
    items: this.items(),
    price: this.price();
    taxes: this.taxes(),
    coupon: this.coupon(),
    discount: this.discount(),
    subtotal,
    amount: subtotal + taxes,
    email: this.email,
  };
};

module.exports = Cart;
