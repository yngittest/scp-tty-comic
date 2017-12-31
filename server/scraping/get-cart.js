'use strict';

const Spooky = require('spooky');

import constant from '../config/scraping';
import Cart from '../api/cart/cart.model';

module.exports = async () => {
  console.log('get cart start!');

  await Cart.remove({});

  return new Promise((resolve, reject) => {
    getCart(function() {
      console.log('get cart finished!');
      resolve();
    });
  });
};

function getCart(callback) {
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
    spooky.then(function() {
      this.emit('getCart', (this.evaluate(function() {
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

    spooky.then(function() {
      this.wait(3000);
    });

    spooky.thenOpen(constant.urls.logout);

    spooky.then(function() {
      this.emit('end');
    });

    spooky.run();
  });

  let cartCount = 0;

  spooky.on('getCart', function(list) {
    for(let element of list) {
      Cart.findOneAndUpdate({name: element.text}, {
        name: element.text,
        url: element.href,
        id: element.href.substr(element.href.length - 13, 13),
        title: element.text.substr(0, element.text.lastIndexOf('\u3000'))
      }, {upsert: true}).exec();
      cartCount++;
    }
  });

  spooky.on('end', function() {
    console.log(`checked cart: ${cartCount}`);
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
