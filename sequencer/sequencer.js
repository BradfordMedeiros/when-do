const sequencer = function() {
	this.the_events=  [ ];
	this.has_been_run = false;
};

const event = function(value, type){
	this.value = value;
	this.type = type;
};

const create_time_promise = (time) => {
	const the_promise =  new Promise((resolve, reject) => {
		setTimeout(() => resolve(), time);
	});
	return the_promise;
};

const create_action_promise = (action) => {
	const value = action();
    
	let the_promise = undefined;
	if (value instanceof Promise){
		the_promise = new Promise((resolve,reject) => {
			value.then((x)=>resolve(x));
			value.catch((x)=>reject(x));
		});
	}else{
		the_promise = new Promise((resolve,reject) => resolve());
	}
	return the_promise;		
}


// This function create whatever different promise types are needed for different functoin behaviors
// Any action should add to this 
function create_promise(event){
    
	const creation_map = {
		then: create_action_promise,
		wait: create_time_promise,
	};
    
	const promise_creation_function = creation_map[event.type];
	if (promise_creation_function === undefined){
		throw (new Error("unsupported event type"));
	}
	return promise_creation_function(event.value);
}

function attach_promise ( promise, index, events, resolve, reject){
  
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
}

sequencer.prototype.then = function(func, times, delay_in_ms){
	if (typeof(func) !== typeof(func)){
		throw (new Error("func in then must be function, provided: ",typeof(func)));
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
	if (typeof (time) !== typeof (1)){
		throw (new Error("time in wait must be of type number, provided type ",typeof(time)));
	}
	this.the_events.push(new event(time,"wait"));
	return this;
};

sequencer.prototype.run = function(){
	if (this.has_been_run === true){
		throw (new Error("a sequence can only be ran once"));
	}
	this.has_been_run = true;
    
	let the_resolve = undefined;
	let the_reject = undefined;
	const sequence_promise = new Promise(function(resolve,reject){
		the_resolve = resolve;
		the_reject = reject;
	});
    
	if (the_resolve === undefined || the_reject === undefined){
		throw (new Error("this should never happen-- only in here for testing, i don't think this code works like this will research but putting here in case this happens"));
	}

	attach_promise(new Promise(function(resolve,reject){resolve();}), 0,this.the_events,the_resolve,the_reject);	
	return sequence_promise;
};

module.exports = () => new sequencer;