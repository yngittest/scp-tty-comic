'use strict';

const _ = require('lodash');
const Spooky = require('spooky');

import constant from '../config/scraping';
import Comic from '../api/comic/comic.model';
import Vol from '../api/vol/vol.model';
import History from '../api/history/history.model';

module.exports = async () => {
  console.log('get comics start!');

  let historyIdList = [];
  await History.find().exec(function(err, docs) {
    historyIdList = _.map(docs, (comic) => {
      return comic.id;
    });
  });

  let comicIdList = [];
  await Comic.find().exec(function(err, docs) {
    comicIdList = _.map(docs, (comic) => {
      return comic.id;
    });
  });

  let newVols = [];
  let readVols = [];
  await Vol.find().exec(function(err, docs) {
    const volIdList = _.map(docs, (comic) => {
      return comic.id;
    });
    newVols = _.difference(volIdList, comicIdList);
    readVols = _.intersection(volIdList, historyIdList);
  });

  await setRead(readVols);

  if(newVols.length > 0) {
    return new Promise((resolve, reject) => {
      getComics(newVols, historyIdList, function() {
        console.log('get comics finished!');
        resolve();
      });
    });
  } else {
    console.log('no new comics');
    return;
  }
};

async function setRead(readVols) {
  for(let i = 0; i < readVols.length; i++) {
    await Comic.update({id: readVols[i]}, { $set: {read: true} });
  }
  return;
}

function getComics(vols, historyIdList, callback) {
  console.log(`new vols: ${vols.length}`);

  let maxVols;
  if(vols.length > constant.maxVolsAtOnce) {
    maxVols = constant.maxVolsAtOnce;
  } else {
    maxVols = vols.length;
  }

  const spooky = new Spooky(constant.spookyOptions, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(constant.urls.comicTop);

    for(var i = 0; i < maxVols; i++) {
      spooky.thenOpen(constant.urls.comicConf + vols[i]);
      spooky.then(function() {
        this.waitForSelector('.detail_head-tit_caps>h2');
      });
      spooky.then(function() {
        this.emit('getComic', this.evaluate(function() {
          return {
            id: document.querySelector('input[name="jan"]').value,
            name: document.querySelector('.detail_head-tit_caps>h2').innerText
          };
        }));
      });
    }

    spooky.then(function() {
      this.emit('end');
    });

    spooky.run();
  });

  let comicsCount = 0;

  spooky.on('getComic', function(comic) {
    Comic.findOneAndUpdate({id: comic.id}, {
      name: comic.name,
      url: constant.urls.comicConf + comic.id,
      id: comic.id,
      title: comic.name.substr(0, comic.name.lastIndexOf('\u3000')),
      new: true,
      read: historyIdList.indexOf(comic.id) >= 0
    }, {upsert: true}).exec();
    comicsCount++;
    console.log(`${comicsCount}/${vols.length} ${comic.name}`);
  });

  spooky.on('end', function() {
    console.log(`new comics: ${comicsCount}`);
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
