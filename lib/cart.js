var Cart = function (stripe, session, minItems, maxItems, locale) {
  this.stripe = stripe;
  this.session = session;

  this.orderId = session.orderId;
  this.locale = (locale || this.session.locale).split('_')[0];

  this.minItems = minItems;
  this.maxItems = maxItems;

  this.local_items = session.items || minItems;
  this.local_coupon = session.coupon;
};

Cart.prototype.create = function () {
  return this.stripe.orders.create({
    currency: 'eur',
    coupon: this.local_coupon,
    items: [
      {
        type: 'sku',
        parent: 'sku_1',
        quantity: this.local_items,
      },
    ],
  }).then((order) => {
    this.order = order;
    this.orderId = order.id;
  });
};

Cart.prototype.retrieve = function () {
  if (!this.orderId) {
    return this.create();
  }

  return this.stripe.orders.retrieve(this.orderId).then((order) => {
    this.order = order;
  });
};

Cart.prototype.compute = function () {
  const sku = this.order.items.find(item => item.type === 'sku');

  return sku ? sku.amount : 0;
};

Cart.prototype.taxes = function () {
  const tax = this.order.items.find(item => item.type === 'tax');

  return tax ? tax.amount : 0;
};

Cart.prototype.discount = function () {
  const discount = this.order.items.find(item => item.type === 'discount');

  return discount ? discount.amount : 0;
};

Cart.prototype.coupon = function () {
  const discount = this.order.items.find(item => item.type === 'discount');

  return discount && discount.parent;
};

Cart.prototype.items = function () {
  const items = this.order.items.find(item => item.type === 'sku');

  return items && items.quantity;
};

Cart.prototype.price = function () {
  const items = this.order.items.find(item => item.type === 'sku');

  return items && items.amount;
};

Cart.prototype.add = function () {
  this.local_items = Math.min(this.local_items + 1, this.maxItems);

  return this.create();
};

Cart.prototype.subtract = function () {
  this.local_items = Math.max(this.local_items - 1, this.minItems);

  return this.create();
};

Cart.prototype.setPreviousOrder = function (order) {
  this.order = order;
};

Cart.prototype.setCoupon = function (couponId) {
  return this.stripe.coupons.retrieve(couponId)
    .then(() => {
      this.local_coupon = couponId;
    })
    .then(this.create);
};

Cart.prototype.setEmail = function (email) {
  this.email = email;
};

Cart.prototype.reset = function () {
  // TODO
  this.items = this.minItems;
  this.coupon = null;
  this.orderId = null;
};

Cart.prototype.save = function () {
  this.session.locale = this.locale;
  this.session.email = this.email;
  this.session.orderId = this.orderId;

  this.session.items = this.local_items;
  this.session.coupon = this.local_coupon;
};

Cart.prototype.toJSON = function () {
  const subtotal = this.compute();
  const taxes = this.taxes();

  return {
    items: this.items(),
    price: this.price(),
    taxes,
    coupon: this.coupon(),
    discount: this.discount(),
    subtotal,
    amount: subtotal + taxes,
    email: this.email,
  };
};

module.exports = Cart;
