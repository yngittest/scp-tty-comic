'use strict';

const batCommon = require('./bat-common');
batCommon();

const getVols = require('./get-vols');
console.log('scraping start!');
getVols(function() {
  console.log('scraping finished');
  process.exit(0);
});
