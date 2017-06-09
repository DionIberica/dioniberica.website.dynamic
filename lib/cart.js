var Cart = function (stripe, session, minItems, maxItems, locale) {
  this.stripe = stripe;
  this.session = session;

  this.orderId = session.orderId;
  this.locale = locale;

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

Cart.prototype.amount = function () {
  return this.order.amount;
};

Cart.prototype.subtotal = function () {
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

Cart.prototype.setPreviousOrder = function (order) {
  this.order = order;
};

Cart.prototype.setQuantity = function (quantity) {
  this.local_items = quantity;
  this.local_items = Math.min(this.local_items, this.maxItems);
  this.local_items = Math.max(this.local_items, this.minItems);

  return this.create();
};

Cart.prototype.setCoupon = function (couponId) {
  return this.stripe.coupons.retrieve(couponId)
    .then(() => {
      this.local_coupon = couponId;
    }).catch((reason) => {
      this.coupon_reason = reason.message;
    })
    .then(() => this.create());
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
  return {
    items: this.items(),
    price: this.price(),
    taxes: this.taxes(),
    coupon: this.coupon(),
    coupon_reason: this.coupon_reason,
    discount: this.discount(),
    subtotal: this.subtotal(),
    amount: this.amount(),
    email: this.email,
  };
};

module.exports = Cart;
