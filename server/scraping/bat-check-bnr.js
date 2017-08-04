'use strict';

const batCommon = require('./bat-common');
batCommon();

const checkBanner = require('./check-bnr');
console.log('scraping start!');
checkBanner(function() {
  console.log('scraping finished');
  process.exit(0);
});
