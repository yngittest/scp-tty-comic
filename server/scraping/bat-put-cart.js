'use strict';

const batCommon = require('./bat-common');
batCommon();

const scpTask = require('./put-cart');
console.log('scraping start!');
scpTask(function() {
  console.log('scraping finished');
  process.exit(0);
});
