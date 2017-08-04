'use strict';

const batCommon = require('./bat-common');
batCommon();

const getCart = require('./get-cart');
console.log('scraping start!');
getCart(function() {
  console.log('scraping finished');
  process.exit(0);
});
