// seq.then(func).wait(1000).then(func1).loop(func2,1000)



var sequencer = function(){
	this.the_events=  [ ];
};
var event = function(value, type){
	this.value = value;
	this.type = type;
};

function create_time_promise (time){	
	var the_promise =  new Promise(function(resolve, reject){
		setTimeout(()=>resolve(),time);
	});
	return the_promise;
}

/*
    If the action is a promise we will wait until the promise resolves before continuing!
*/ 
function create_action_promise (action){
	var value = action();
    
    var the_promise = undefined;
    if (value instanceof Promise){
        the_promise = new Promise(function(resolve,reject){
            value.then((x)=>resolve(x));
            value.catch((x)=>reject(x));
        });
    }else{
        the_promise = new Promise(function(resolve,reject){resolve()});
    }
	return the_promise;		
}


// This function create whatever different promise types are needed for different functoin behaviors
// Any action should add to this 
function create_promise(event){
    
    var creation_map = {
        then: create_action_promise,
        wait: create_time_promise,
    };
    
    var promise_creation_function = creation_map[event.type];
    if (promise_creation_function === undefined){
        throw (new Error("unsupported event type"));
    }
    return promise_creation_function(event.value);
}

function attach_promise ( promise, index,events){
	promise.then(()=>{
		var the_promise = create_promise(events[index]);
		the_promise.then(()=>{
			if (index < events.length){
				attach_promise(the_promise, index+1, events);
			}		
		});
	})
}

sequencer.prototype.loop = function(func, times, delay_in_ms){

	if (typeof(func) !== typeof(func)){
		throw (new Error("func in loop must be function, provided: ",typeof(func)));
	}
	
	if (typeof(times) !== typeof(1)){
		throw (new Error("func in loop must be number, provided: ",typeof(times)));
	}
	
	if (delay_in_ms !== undefined && (typeof(delay_in_ms) !== typeof(1))){
		throw (new Error("delay_in_ms in loop must be number if it is passed as parameter(optiona parameter), provided: ",typeof(times)));
	}
	
	for (var i = 0 ; i < times; i++){
		this.the_events.push(new event(func,'then'));
		if (delay_in_ms !== undefined){
			this.the_events.push(new event(delay_in_ms, 'wait'));
		}
	}
	return this;
};

//if func returns a promise, we wait for that promise to be satisfied before moving on
sequencer.prototype.then = function(func){
	if (typeof(func) !== typeof(func)){
		throw (new Error("func in then must be function, provided: ",typeof(func)));
	}
	this.the_events.push(new event(func,'then'));
	return this;
};

sequencer.prototype.wait = function(time){
	if (typeof (time) !== typeof (1)){
		throw (new Error("time in wait must be of type number, provided type ",typeof(time)));
	}
	this.the_events.push(new event(time,'wait'));
	return this;
};

sequencer.prototype.run = function(){
	
	var last_promise = undefined;
	last_promise = create_promise(this.the_events[0]);
	attach_promise(last_promise, 1,this.the_events);	
	this.the_events = [ ];
};


module.exports = sequencer;