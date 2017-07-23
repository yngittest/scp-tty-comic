'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './vol.events';

var VolSchema = new mongoose.Schema({
  id: String
});

registerEvents(VolSchema);
export default mongoose.model('Vol', VolSchema);
