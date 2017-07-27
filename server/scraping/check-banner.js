'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';

module.exports = function(callback) {
  console.log('check banner start!');
  checkBanner(function() {
    console.log('check banner finished!');
    return callback();
  });
};

function checkBanner(callback) {
  const spooky = new Spooky(constant.spookyOptions, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(constant.urls.logout);
    spooky.thenOpen(constant.urls.comicTop);
    spooky.thenOpen(constant.urls.login);
    spooky.then([{
      id: constant.loginId,
      pass: constant.loginPass
    }, function() {
      this.fill('form#form1', {
        LOGIN_ID: id,
        PASSWORD: pass
      }, false);
    }]);
    spooky.thenClick('.tmBox00 .submitButton1');
    spooky.then(function() {
      this.waitForSelector('.cosmo_contents-border>a>img');
    });

    spooky.then(function() {
      this.emit('bnrUrl', this.evaluate(function() {
        return document.querySelector('.cosmo_contents-border>a>img').src;
      }));
    });

    spooky.thenOpen(constant.urls.logout);
    spooky.run();
  });

  spooky.on('bnrUrl', function(url) {
    console.log(url);
    if(~url.indexOf(constant.bnrPattern)) {
      console.log('comic banner matched the pattern!');
    }
    return callback();
  });

  spooky.on('error', function(e, stack) {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
    return callback();
  });
}