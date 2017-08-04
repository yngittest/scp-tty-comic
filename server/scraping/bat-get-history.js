'use strict';

const batCommon = require('./bat-common');
batCommon();

const getHistory = require('./get-history');
console.log('scraping start!');
getHistory(function() {
  console.log('scraping finished');
  process.exit(0);
});
