/**
 * History model events
 */

'use strict';

import {EventEmitter} from 'events';
var HistoryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
HistoryEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(History) {
  for(var e in events) {
    let event = events[e];
    History.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    HistoryEvents.emit(event + ':' + doc._id, doc);
    HistoryEvents.emit(event, doc);
  };
}

export {registerEvents};
export default HistoryEvents;
