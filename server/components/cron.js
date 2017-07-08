'use strict';

const CronJob = require('cron').CronJob;

import scraping from './scraping';

export default function startCron() {
  console.log('cron start!');
  const cronTime = '00 * * * * *';
  const timezone = 'Asia/Tokyo';
  const job = new CronJob(cronTime, scraping, null, true, timezone);
}
