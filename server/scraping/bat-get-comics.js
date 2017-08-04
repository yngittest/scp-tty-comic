'use strict';

const batCommon = require('./bat-common');
batCommon();

const getComics = require('./get-comics');
console.log('scraping start!');
getComics(function() {
  console.log('scraping finished');
  process.exit(0);
});
