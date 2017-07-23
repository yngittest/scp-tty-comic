'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import History from '../api/history/history.model';

module.exports = function(callback) {
  console.log('get history start!');
  const spooky = new Spooky(constant.spookyOptions, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(constant.urls.logout);
    spooky.thenOpen(constant.urls.comicHistory);
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
      this.waitForSelector('input[name="deleteHistoryList"]');
    });

    spooky.then(function() {
      const pager = this.evaluate(function() {
        return document.querySelector('.c_pager_num>ul>li:nth-last-child(3)>a').text;
      });

      var history = [];
      for(var i = 0; i < pager; i++) {
        this.then(function() {
          this.waitForSelector('input[name="deleteHistoryList"]');
        });
        this.then(function() {
          history = history.concat(this.evaluate(function() {
            var list = document.querySelectorAll('.c_bold>a');
            var comics = [];
            for(var i = 0; i < list.length; i++) {
              comics.push({
                name: list[i].text,
                url: list[i].href,
                id: list[i].href.substr(list[i].href.length - 13, 13),
                title: list[i].text.substr(0, list[i].text.lastIndexOf('\u3000'))
              });
            }
            return comics;
          }));
        });
        this.then(function() {
          if(this.exists('.c_pager_num-next>a')) {
            this.click('.c_pager_num-next>a');
          }
        });
      }

      this.then(function() {
        this.emit('load', history);
      });
    });

    spooky.thenOpen(constant.urls.logout);
    spooky.run();
  });

  spooky.on('load', function(list) {
    console.log('history:' + list.length);

    const uniqueHistory = common.distinct(list, 'id');
    console.log('uniqueHistory:' + uniqueHistory.length);

    for(let comic of uniqueHistory) {
      History.findOneAndUpdate({name: comic.name}, comic, {upsert: true}).exec();
    }
    console.log('get history finished!');
    return callback();
  });

  spooky.on('error', function(e, stack) {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
    return callback();
  });
};
