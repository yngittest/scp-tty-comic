'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import Comic from '../api/comic/comic.model';
import Cart from '../api/cart/cart.model';

module.exports = function(callback) {
  console.log('put cart start!');
  Cart.find().exec(function(err, docs) {
    let cartIdList = [];
    for(let comic of docs) {
      cartIdList.push(comic.id);
    }
    Comic.find({new: true}).exec(function(err, docs) {
      let newComicIdList = [];
      for(let comic of docs) {
        if(cartIdList.indexOf(comic.id) < 0) {
          newComicIdList.push(comic.id);
        }
      }
      if(newComicIdList.length > 0) {
        putCart(newComicIdList, function(){
          console.log('put cart finished!');
          return callback();
        });
      } else {
        console.log('no new comics to put cart');
        return callback();
      }
    });
  });
};

function putCart(newComicIdList, callback) {
  console.log(`new comics: ${newComicIdList.length}`);

  const spooky = new Spooky(constant.spookyOptions, function(err) {
    if(err) {
      let e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }

    spooky.start();

    spooky.open(constant.urls.logout);
    spooky.thenOpen(constant.urls.comicCart);
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
      this.waitForSelector('input[name="delComicID"]');
    });
    for(var i = 0; i < newComicIdList.length; i++) {
      spooky.thenOpen(constant.urls.comicPutCart + newComicIdList[i]);
      spooky.then(function() {
        this.waitForSelector('input[name="delComicID"]');
      });
      spooky.then(function() {
        this.emit('putCart');
      });
    }

    spooky.thenOpen(constant.urls.logout);

    spooky.then(function() {
      this.emit('end');
    });

    spooky.run();
  });

  let comicsCount = 0;

  spooky.on('putCart', function() {
    comicsCount++;
  });

  spooky.on('end', function() {
    console.log(`${comicsCount} comics added to cart`);
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
