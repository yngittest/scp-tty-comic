/**
 * Banner model events
 */

'use strict';

import {EventEmitter} from 'events';
var BannerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BannerEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Banner) {
  for(var e in events) {
    let event = events[e];
    Banner.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    BannerEvents.emit(event + ':' + doc._id, doc);
    BannerEvents.emit(event, doc);
  };
}

export {registerEvents};
export default BannerEvents;
