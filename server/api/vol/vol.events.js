/**
 * Vol model events
 */

'use strict';

import {EventEmitter} from 'events';
var VolEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
VolEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Vol) {
  for(var e in events) {
    let event = events[e];
    Vol.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    VolEvents.emit(event + ':' + doc._id, doc);
    VolEvents.emit(event, doc);
  };
}

export {registerEvents};
export default VolEvents;
