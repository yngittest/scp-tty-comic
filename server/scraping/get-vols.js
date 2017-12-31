'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import History from '../api/history/history.model';
import Cart from '../api/cart/cart.model';
import Vol from '../api/vol/vol.model';

module.exports = async () => {
  console.log('get vols start!');

  let history;
  await History.find().exec(function(err, docs) {
    history = docs;
  });

  let titles;
  await Cart.find().exec(function(err, docs) {
    const comics = history.concat(docs);
    titles = common.distinct(comics, 'title');
  });

  return new Promise((resolve, reject) => {
    getVols(titles, function() {
      console.log('get vols finished!');
      resolve();
    });
  });
};

function getVols(titles, callback) {
  console.log(`titles: ${titles.length}`);

  const spooky = new Spooky(constant.spookyOptions, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(constant.urls.comicTop);

    for(var i = 0; i < titles.length; i++) {
      spooky.thenOpen(titles[i].url);
      spooky.then(function() {
        this.waitForSelector('input[name="single_jan"]');
      });
      spooky.then(function() {
        this.emit('getVol', this.evaluate(function() {
          return document.querySelector('input[name="single_jan"]').value.split(',');
        }));
      });
    }

    spooky.then(function() {
      this.wait(3000);
    });

    spooky.then(function() {
      this.emit('end');
    });

    spooky.run();
  });

  let volsCount = 0;
  let titlesCount = 0;

  spooky.on('getVol', function(list) {
    for(let vol of list) {
      Vol.findOneAndUpdate({id: vol}, {id: vol}, {upsert: true}).exec();
      volsCount++;
    }
    titlesCount++;
    console.log(`${titlesCount}/${titles.length} ${titles[titlesCount-1].title} +${list.length}`);
  });

  spooky.on('end', function() {
    console.log(`vols: ${volsCount}`);
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
