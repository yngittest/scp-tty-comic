'use strict';

import getHistory from './get-history';
import getVols from './get-vols';
import getComics from './get-comics';
import checkBanner from './check-banner';

module.exports = function() {
  console.log('scraping start!');
  // checkBanner(function() {
  //   getHistory(function() {
  //     getVols(function() {
  //       getComics(function() {
  //         console.log('scraping finished');
  //       });
  //     });
  //   });
  // });
  getComics(function() {
    console.log('scraping finished');
  });
  // checkBanner(function() {
  //   console.log('scraping finished');
  // });
};
