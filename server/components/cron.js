'use strict';

const CronJob = require('cron').CronJob;

import scraping from './scraping';

const type = process.env.BATCH_TYPE;

export default function startCron() {
  if(type == 'now') {
    console.log('now!');
    scraping();
  } else if(type == 'cron') {
    console.log('cron start!');
    const cronTime = '00 */5 * * * *';
    const timezone = 'Asia/Tokyo';
    const job = new CronJob(cronTime, scraping, null, true, timezone);
  } else {
    console.log('BATCH_TYPE is not configured');
  }
}
