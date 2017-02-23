
const event = require('./attach_promise').event;
const attach_promise = require('./attach_promise').attach_promise;

const sequencer = function() {
	this.the_events=  [ ];
	this.has_been_run = false;
};

sequencer.prototype.then = function(func, times, delay_in_ms){
	if (typeof(func) !== typeof(func) ||
		(times !== undefined && !Number.isInteger(times)) ||
		((delay_in_ms !== undefined) && !Number.isInteger(delay_in_ms))){
		throw (new Error("invalid parameters to then call in sequencer"));
	}

	const timesToExecute = times === undefined ? 1: times;
	for (let i = 0 ; i < times - 1; i++){
    this.the_events.push(new event(func,"then"));
    if (delay_in_ms !== undefined){
      this.the_events.push(new event(delay_in_ms, "wait"));
    }
  }
  this.the_events.push(new event(func,"then"));
  return this;
};

sequencer.prototype.wait = function(time){
	if (!Number.isInteger(time)){
		throw (new Error("invalid parameters to wait call in sequencer"));
	}
	this.the_events.push(new event(time,"wait"));
	return this;
};

sequencer.prototype.hold = function(promiseUntilHold) {
	if (!promiseUntilHold instanceof Promise){
		throw (new Error("invalid paramters to hold in sequencer"));
	}
	this.the_events.push(new event(promiseUntilHold, "hold"));
	return this;
};

sequencer.prototype.run = function(){
	if (this.has_been_run === true){
		throw (new Error("a sequence can only be ran once"));
	}
	this.has_been_run = true;
    
	let the_resolve = undefined;
	let the_reject = undefined;
	const sequence_promise = new Promise((resolve,reject) => {
		the_resolve = resolve;
		the_reject = reject;
	});
	attach_promise(new Promise((resolve,reject) => resolve()), 0, this.the_events, the_resolve,the_reject);
	return sequence_promise;
};

module.exports = () => new sequencer;