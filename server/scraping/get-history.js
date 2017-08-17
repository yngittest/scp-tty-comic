'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import History from '../api/history/history.model';

module.exports = function(callback) {
  console.log('get history start!');
  History.find().exec(function(err, docs) {
    const pagerStart = Math.ceil(docs.length / 20);
    getHistory(pagerStart, function() {
      console.log('get history finished!');
      return callback();
    });
  });
};

function getHistory(pagerStart, callback) {
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
    spooky.then(function() {
      this.waitForSelector('form#form1');
    });
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
      this.emit('echo', 'login succeeded');
    });
    spooky.then(function() {
      this.waitForSelector('.c_pager_num>ul>li:nth-last-child(3)>a');
    });

    spooky.then([{
      pagerUrl: constant.urls.comicHistory + '&pageNo=',
      pagerStart: pagerStart
    }, function() {
      const pager = this.evaluate(function() {
        return document.querySelector('.c_pager_num>ul>li:nth-last-child(3)>a').text;
      });

      for(var i = pagerStart ; i <= pager; i++) {
        this.thenOpen(pagerUrl + i);
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
    }]);

    spooky.then(function() {
      this.wait(3000);
    });

    spooky.thenOpen(constant.urls.logout);

    spooky.then(function() {
      this.emit('end');
    });

    spooky.run();
  });

  let historyCount = 0;
  let pagerCount = pagerStart;

  spooky.on('getHistory', function(list) {
    for(let element of list) {
      History.findOneAndUpdate({name: element.text}, {
        name: element.text,
        url: element.href,
        id: element.href.substr(element.href.length - 13, 13),
        title: element.text.substr(0, element.text.lastIndexOf('\u3000'))
      }, {upsert: true}).exec();
      historyCount++;
    }
    console.log(`get history pager ${pagerCount}`);
    pagerCount++;
  });

  spooky.on('end', function() {
    console.log(`checked history: ${historyCount}`);
    return callback();
  });

  spooky.on('echo', function(msg) {
    console.log(msg);
  });

  spooky.on('error', function(e, stack) {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
    return callback();
  });
}
