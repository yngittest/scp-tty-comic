'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import History from '../api/history/history.model';
import Comic from '../api/comic/comic.model';
import Vol from '../api/vol/vol.model';

module.exports = function(callback) {
  console.log('get vols start!');
  History.find().exec(function(err, docs) {
    const titles = common.distinct(docs, 'title');
    Comic.find().exec(function(err, docs) {
      let comics = [];
      for(let vol of docs) {
        comics.push(vol.id);
      }
      getVols(titles, comics, function() {
        return callback();
      });
    });
  });
};

function getVols(titles, comics, callback) {
  console.log(`titles: ${titles.length}`);

  let vols = [];
  let volsCount = 0;

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
        this.emit('getVols', this.evaluate(function() {
          return document.querySelector('input[name="single_jan"]').value.split(',');
        }));
      });
    }

    spooky.then(function() {
      this.emit('load');
    });

    spooky.run();
  });

  spooky.on('getVols', function(list) {
    vols = vols.concat(list);
    volsCount++;
    console.log(`${volsCount}/${titles.length} ${titles[volsCount-1].title} +${list.length} vols ${vols.length}`);
  });

  spooky.on('load', function() {
    console.log(`vols total ${vols.length}`);
    for(let vol of vols) {
      Vol.findOneAndUpdate({id: vol}, {id: vol}, {upsert: true}).exec();
    }
    console.log('get vols finished!');
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
