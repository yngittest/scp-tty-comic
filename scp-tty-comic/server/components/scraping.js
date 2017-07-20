'use strict';

const Spooky = require('spooky');
import History from '../api/history/history.model';

const loginId = process.env.TSUTAYA_ID;
const loginPass = process.env.TSUTAYA_PASS;

const urls = {
  login: 'https://www.discas.net/netdvd/tLogin.do?pT=0',
  logout: 'http://www.discas.net/netdvd/doLogout.do?pT=0',
  history: 'https://movie-tsutaya.tsite.jp/netdvd/comic/comicRentalHistory.do?pT=0&pT=0'
};

module.exports = function() {
  console.log('scraping start!');

  const options = {
    child: {
      transport: 'http'
    },
    casper: {
      logLevel: 'debug',
      verbose: true,
      waitTimeout: 180000
    }
  };

  const spooky = new Spooky(options, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(urls.logout);
    spooky.thenOpen(urls.history);
    spooky.thenOpen(urls.login);
    spooky.then([{id: loginId, pass: loginPass}, function() {
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
          history = history.concat(this.evaluate(function() {
            var list = document.querySelectorAll('.c_bold>a');
            var comics = [];
            for(var i = 0; i < list.length; i++) {
              comics.push({
                text: list[i].text,
                href: list[i].href,
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
        this.emit('history', history);
      });

      var titles = [];
      this.then(function() {
        var uniqueList = {};
        for(var i = 0; i < history.length; i++) {
          if(!uniqueList[history[i].title]) {
            uniqueList[history[i].title] = history[i];
            titles.push(history[i]);
          }
        }
      });
      this.then(function() {
        this.emit('titles', titles);
      });

      this.then(function() {
        var vols = [];
        for(var i = 0; i < titles.length; i++) {
          this.thenOpen(titles[i].href);
          this.then(function() {
            vols.push(this.evaluate(function() {
              return document.querySelector('input[name="single_jan"]').value;
            }));
          });
        }
        this.then(function() {
          this.emit('vols', vols);
        });
      });
    });

    spooky.then(function() {
      this.emit('join', 'hoge');
    });
    spooky.then(function() {
      this.emit('load', 'hoge');
    });

    spooky.thenOpen(urls.logout);
    spooky.then(function() {
      this.emit('echo', 'scraping finished!');
    });
    spooky.run();
  });

  let history = [];
  spooky.on('history', function(list) {
    history = list;
    console.log('history:' + history.length);
  });

  let titles = [];
  spooky.on('titles', function(list) {
    titles = list;
    console.log('titles:' + titles.length);
  });

  let vols = [];
  spooky.on('vols', function(list) {
    vols = list;
    console.log('vols:' + vols.length);
  });

  spooky.on('join', function(aaa) {
    console.log('join');
    for(var i = 0; i < titles.length; i++) {
      titles[i].vols = vols[i].split(',');
    }
  });

  spooky.on('load', function(aaa) {
    console.log('load');
    for(let element of titles) {
      console.log(JSON.stringify(element));
      // History.findOneAndUpdate({id: element.id}, element, {upsert: true}, function(error, results) {
      //   console.log(element.title);
      // });
    }
  });

  spooky.on('echo', function(msg) {
    console.log(msg);
  });

  spooky.on('error', function(e, stack) {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
  });
};
