'use strict';

module.exports = function(taskFilePath) {
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

  // Run scraping task
  const scpTask = require(taskFilePath);
  const runScp = async () => {
    console.log(`scraping start! (${taskFilePath})`);
    await scpTask();
    console.log('scraping finished');
    process.exit(0);
  };
  runScp();
};
