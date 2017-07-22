'use strict';

const Spooky = require('spooky');
import History from '../api/history/history.model';
import Comic from '../api/comic/comic.model';

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
          this.waitForSelector('.c_bold>a');
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

      var uniqueHistory = [];
      this.then(function() {
        var uniqueList = {};
        for(var i = 0; i < history.length; i++) {
          if(!uniqueList[history[i].id]) {
            uniqueList[history[i].id] = history[i];
            uniqueHistory.push(history[i]);
          }
        }
      });
      this.then(function() {
        this.emit('history', uniqueHistory);
      });

      var titles = [];
      this.then(function() {
        var uniqueList = {};
        for(var i = 0; i < uniqueHistory.length; i++) {
          if(!uniqueList[uniqueHistory[i].title]) {
            uniqueList[uniqueHistory[i].title] = uniqueHistory[i];
            titles.push(uniqueHistory[i]);
          }
        }
      });
      this.then(function() {
        this.emit('titles', titles);
      });

      this.then(function() {
        var vols = [];
        for(var i = 0; i < titles.length; i++) {
          this.thenOpen(titles[i].url);
          this.then(function() {
            this.waitForSelector('input[name="single_jan"]');
          });
          this.then(function() {
            vols.push(this.evaluate(function() {
              return document.querySelector('input[name="single_jan"]').value.split(',');
            }));
          });
        }
        var comics = [];
        this.then(function() {
          for(var i = 0; i < vols.length; i++) {
            for(var j = 0; j < vols[i].length; j++) {
              comics.push({
                title: titles[i].title,
                url: titles[i].url.substr(0, titles[i].url.length - 13) + vols[i][j],
                id: vols[i][j]
              });
            }
          }
        });
        this.then(function() {
          this.emit('comics', comics);
        });
      });
    });

    // spooky.then(function() {
    //   this.emit('load');
    // });

    spooky.thenOpen(urls.logout);
    spooky.then(function() {
      this.emit('echo', 'scraping finished!');
    });
    spooky.run();
  });

  spooky.on('history', function(list) {
    console.log('history:' + list.length);
    for(var i = 0; i < list.length; i++) {
      History.findOneAndUpdate({name: list[i].name}, list[i], {upsert: true}).exec();
    }
  });

  let titles = [];
  spooky.on('titles', function(list) {
    titles = list;
    console.log('titles:' + titles.length);
  });

  spooky.on('comics', function(list) {
    console.log('comics:' + list.length);
    for(var i = 0; i < 5; i++) {
      console.log(list[i]);
    }
    // for(var i = 0; i < list.length; i++) {
    //   titles[i].vols = list[i].split(',');
    //   titles[i].url = titles[i].url.substr(0, titles[i].url.length - 13) + titles[i].vols[titles[i].vols.length - 1];
    // }
  });

  // spooky.on('load', function() {
  //   console.log('load');
  //   for(var i = 0; i < titles.length; i++) {
  //     Comic.findOneAndUpdate({title: titles[i].title}, titles[i], {upsert: true}).exec();
  //   }
  // });

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
