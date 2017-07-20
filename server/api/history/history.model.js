'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './history.events';

var HistorySchema = new mongoose.Schema({
  name: String,
  url: String,
  id: String,
  title: String
});

registerEvents(HistorySchema);
export default mongoose.model('History', HistorySchema);
