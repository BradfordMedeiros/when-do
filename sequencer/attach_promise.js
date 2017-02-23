const create_time_promise = require('./actions/time_promise');
const create_action_promise =  require('./actions/action_promise');
const create_hold_prommise = require('./actions/hold_promise');

const event = function(value, type){
  this.value = value;
  this.type = type;
};

const creation_map = {
  then: create_action_promise,
  wait: create_time_promise,
  hold: create_hold_prommise,
};

const create_promise = (event) => {
  const promise_creation_function = creation_map[event.type];
  if (promise_creation_function === undefined){
    throw (new Error("unsupported event type"));
  }
  return promise_creation_function(event.value);
};

const attach_promise = ( promise, index, events, resolve, reject) => {
  if (index >= events.length){
    resolve();
  }else{
    promise.then(()=>{
      if (index < events.length){
        const the_promise = create_promise(events[index]);
        the_promise.then(()=>{
          attach_promise(the_promise,index+1, events,resolve,reject);
        }).catch((x)=>reject(x));
      }
    });
    promise.catch((x)=>reject(x));
  }
};

module.exports = {
  event,
  attach_promise,
};