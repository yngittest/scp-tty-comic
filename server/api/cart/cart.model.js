'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './cart.events';

var CartSchema = new mongoose.Schema({
  name: String,
  url: String,
  id: String,
  title: String
});

registerEvents(CartSchema);
export default mongoose.model('Cart', CartSchema);
