'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import Banner from '../api/banner/banner.model';

module.exports = async () => {
  console.log('check banner start!');
  return new Promise((resolve, reject) => {
    checkBanner(function() {
      console.log('check banner finished!');
      resolve();
    });
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
      this.waitForSelector('#slide1 img');
    });

    spooky.then(function() {
      this.emit('bnrUrl', this.evaluate(function() {
        return document.querySelector('#slide1 img').src;
      }));
    });

    spooky.thenOpen(constant.urls.logout);
    spooky.run();
  });

  spooky.on('bnrUrl', function(url) {
    console.log(url);
    Banner.find({}, {}, {sort: {updated: -1}, limit:1})
      .exec(function(err, docs) {
        if(docs[0]) {
          if(url !== docs[0].url) {
            console.log(`new banner: ${url}`);
            if(~url.indexOf(constant.bnrPattern)) {
              console.log(`new banner matched the pattern: ${url}`);
            }
          }
        } else {
          console.log(`new banner: ${url}`);
        }

        Banner.findOneAndUpdate({url: url}, {
          url: url,
          filename: url.substr(url.lastIndexOf('/') + 1),
          updated: Date.now()
        }, {upsert: true}).exec(function() {
          return callback();
        });
      });
  });

  spooky.on('error', function(e, stack) {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
    return callback();
  });
}
