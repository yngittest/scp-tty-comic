'use strict';

const CronJob = require('cron').CronJob;

import scraping from './scraping/scp-comic';

const type = process.env.BATCH_TYPE;
const cronTime = process.env.CRON_TIME;
const timezone = process.env.TIMEZONE;

export default function startCron() {
  if(type == 'now') {
    console.log('start now!');
    scraping();
  } else if(type == 'cron') {
    console.log('start cron!');
    const job = new CronJob(cronTime, scraping, null, true, timezone);
  } else {
    console.log('env "BATCH_TYPE" is not configured');
  }
}
