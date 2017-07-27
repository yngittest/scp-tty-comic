'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import History from '../api/history/history.model';

module.exports = function(callback) {
  console.log('get history start!');
  getHistory(function() {
    console.log('get history finished!');
    return callback();
  });
};

function getHistory(callback) {
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

      for(var i = 0; i < pager; i++) {
        this.then(function() {
          this.waitForSelector('input[name="deleteHistoryList"]');
        });
        this.then(function() {
          this.emit('getHistory', (this.evaluate(function() {
            var comics = [];
            Array.prototype.forEach.call(document.querySelectorAll('.c_bold>a'), function(node) {
              comics.push({
                text: node.text,
                href: node.href
              });
            });
            return comics;
          })));
        });
        this.then(function() {
          if(this.exists('.c_pager_num-next>a')) {
            this.click('.c_pager_num-next>a');
          }
        });
      }

      this.then(function() {
        this.emit('load');
      });
    });

    spooky.thenOpen(constant.urls.logout);
    spooky.run();
  });

  let history = [];
  let pagerCount = 0;

  spooky.on('getHistory', function(list) {
    for(let element of list) {
      history.push({
        name: element.text,
        url: element.href,
        id: element.href.substr(element.href.length - 13, 13),
        title: element.text.substr(0, element.text.lastIndexOf('\u3000'))
      });
    }
    pagerCount++;
    console.log(`get history pager ${pagerCount}`);
  });

  spooky.on('load', function() {
    console.log(`history: ${history.length}`);

    const uniqueHistory = common.distinct(history, 'id');
    console.log(`unique history: ${uniqueHistory.length}`);

    for(let comic of uniqueHistory) {
      History.findOneAndUpdate({name: comic.name}, comic, {upsert: true}).exec();
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
