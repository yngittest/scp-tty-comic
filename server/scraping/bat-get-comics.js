'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register');
}

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('../config/environment');

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

const getComics = require('./get-comics');
console.log('scraping start!');
getComics(function() {
  console.log('scraping finished');
  process.exit(0);
});
