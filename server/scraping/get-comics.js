'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import common from './common';
import Comic from '../api/comic/comic.model';
import Vol from '../api/vol/vol.model';

module.exports = function(callback) {
  console.log('get comics start!');
  Vol.find().exec(function(err, docs) {
    const vols = docs;
    Comic.find().exec(function(err, docs) {
      let comicIdList = [];
      for(let comic of docs) {
        comicIdList.push(comic.id);
      }
      let newVols = [];
      for(let vol of vols) {
        if(comicIdList.indexOf(vol.id) < 0) {
          newVols.push(vol.id);
        }
      }
      getComics(newVols, function(){
        return callback();
      });
    });
  });
};

function getComics(vols, callback) {
  console.log(`new vols: ${vols.length}`);

  let comics = [];
  let comicsCount = 0;

  let maxVols = vols.length;
  if(vols.length > constant.maxVolsAtOnce) {
    maxVols = constant.maxVolsAtOnce;
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
        this.emit('getComics', this.evaluate(function() {
          return document.querySelector('.detail_head-tit_caps>h2').innerText;
        }));
      });
    }

    spooky.then(function() {
      this.emit('load');
    });

    spooky.run();
  });

  spooky.on('getComics', function(name) {
    comics.push({
      name: name,
      url: constant.urls.comicConf + vols[comicsCount],
      id: vols[comicsCount],
      title: name.substr(0, name.lastIndexOf('\u3000')),
      recent: true
    });
    comicsCount++;
    console.log(`${comicsCount}/${vols.length} ${name}`);
  });

  spooky.on('load', function() {
    console.log(`${comics.length} new comics added`);
    Comic.update({}, {recent: false}, {multi: true}).exec(function(err, doc) {
      for(let comic of comics) {
        Comic.findOneAndUpdate({id: comic.id}, comic, {upsert: true}).exec();
      }
      console.log('get comics finished!');
      return callback();
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
