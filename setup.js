var key = process.env['STRIPE_EN'];
var stripe = require('stripe')(key);
/*

stripe.products.create({
  id: 'prod_1',
  name: 'Dion Blister',
  description: ' 10 comprimidos Dion',
}).then(() => {
  return stripe.skus.create({
    id: 'sku_1',
    product: 'prod_1',
    price: 500,
    currency: 'eur',
    inventory: {type: 'infinite'}
  });
}).then(() => {
  return stripe.coupons.create({
    percent_off: 85,
    duration: 'once',
    id: 'TESTDION'
  });
});
*/

stripe.orders.create({
  currency: 'eur',
  coupon: 'TESTDION2',
  items: [
    {
      type: 'sku',
      parent: 'sku_1',
      amount: 500,
      quantity: 1,
    }
  ],
  shipping: {
    name: 'James Thomas',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111'
    }
  },
  email: 'james.thomas@example.com'
});
, function(err, order) {
    if(err) {
      console.log(err);
      return;
    }

    debugger

    console.log('Order completed');
});
