'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './banner.events';

var BannerSchema = new mongoose.Schema({
  url: String,
  filename: String,
  updated: Date
});

registerEvents(BannerSchema);
export default mongoose.model('Banner', BannerSchema);
