'use strict';

import getHistory from './get-history';
import getVols from './get-vols';
import getComics from './get-comics';

module.exports = function() {
  console.log('scraping start!');
  getHistory(function() {
    getVols(function() {
      getComics(function() {
        console.log('scraping finished');
      });
    });
  });
  // getComics();
};
