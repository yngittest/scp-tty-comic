'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import Comic from '../api/comic/comic.model';
import Vol from '../api/vol/vol.model';
import History from '../api/history/history.model';

module.exports = function(callback) {
  console.log('get comics start!');
  History.find().exec(function(err, docs) {
    let historyIdList = [];
    for(let comic of docs) {
      historyIdList.push(comic.id);
    }
    Comic.find().exec(function(err, docs) {
      let comicIdList = [];
      for(let comic of docs) {
        comicIdList.push(comic.id);
      }
      Vol.find().exec(function(err, docs) {
        let newVols = [];
        for(let vol of docs) {
          if(comicIdList.indexOf(vol.id) < 0) {
            newVols.push(vol.id);
          }
        }
        if(newVols.length > 0) {
          getComics(newVols, historyIdList, function(){
            console.log('get comics finished!');
            return callback();
          });
        } else {
          console.log('no new comics');
          return callback();
        }
      });
    });
  });
};

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
      this.emit('load');
    });

    spooky.run();
  });

  let comics = [];
  let comicsCount = 0;

  spooky.on('getComic', function(comic) {
    comics.push({
      name: comic.name,
      url: constant.urls.comicConf + comic.id,
      id: comic.id,
      title: comic.name.substr(0, comic.name.lastIndexOf('\u3000')),
      new: true,
      read: historyIdList.indexOf(comic.id) >= 0
    });
    comicsCount++;
    console.log(`${comicsCount}/${vols.length} ${comic.name}`);
  });

  spooky.on('load', function() {
    console.log(`${comics.length} new comics added`);
    for(let comic of comics) {
      Comic.findOneAndUpdate({id: comic.id}, comic, {upsert: true}).exec();
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
