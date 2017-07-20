'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './comic.events';

var ComicSchema = new mongoose.Schema({
  name: String,
  url: String,
  id: String,
  title: String,
  vols: [String]
});

registerEvents(ComicSchema);
export default mongoose.model('Comic', ComicSchema);
