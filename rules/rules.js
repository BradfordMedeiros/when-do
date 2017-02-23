let handle = require("./handle.js");
let handle_count = 0;

var logic = {
	type : "logic",
	conditions : [ ],
    
	when: function(data, evaluator){
		if (typeof (evaluator) !== typeof(function(){})){
			throw (new Error("evaluator must be defined as a function"));
		}
		this.type = "when";
		return new execute(data,evaluator);
	},
};

function execute(data, evaluator){
	this.data = data;
	this.evaluator = evaluator;
	this.type = "do";
}
execute.prototype.do = function(action,options){
	var that = this;
	
	var rate = 1000;
	if (options !== undefined && options.rate !== undefined){
		rate = options.rate;
	}
	
	var action_limit = Infinity;
	if (options !== undefined && options.action_limit !==undefined){
		action_limit = options.action_limit;
	}
	
	var eval_limit = Infinity;
	if (options !==undefined && options.eval_limit !== undefined){
		eval_limit = options.eval_limit;
	}
	
	var condition = {
		handle_id : handle_count,
		interval_handle: undefined,
		data: that.data,
		evaluator: that.evaluator,
		action: action,
		action_limit: action_limit,
		eval_limit : eval_limit,
		rate: rate, 
		state: undefined,
		value: undefined
	};

	start_condition(condition);
	logic.conditions.push(condition);
	return new handle(logic, condition.handle_id);
};
execute.prototype.do_once = function(action, options){
	if (options && options.action_limit !== undefined && options.action_limit !== 1){
    throw (new Error("action limit was specified in options and as a value other than 1 "));
	}

	const enhancedOptions = {
		eval_limit: options ? options.eval_limit : undefined,
		action_limit: 1,
		rate: options ? options.rate : undefined,
	}
	return this.do(action, enhancedOptions);
};

// expect to evaluate to true and if not signal an alarm
logic.expectWithin = function (first_condition, second_condition, timeout, callback, goodcallback) {
	logic.when({}, first_condition).do_once(() =>{
		let timeElapsed = false;
    setTimeout(() => timeElapsed = true, timeout);
    const innerHandle = logic.when({ }, () => {
    	if (timeElapsed === true){
    		innerHandle.stop();
    		callback();
			}else{
    		const value = second_condition();
				return value;
			}
		}).do_once(goodcallback);
	})
}

logic.transition = function(first_condition, second_condition, callback){

	let last_first_is_true = false;
	const innerHandle = logic.when({}, () => {
		const first  = first_condition();
    if (first){
    	last_first_is_true = true;
    	return false
		}else{
    	if (last_first_is_true){
        const sec = second_condition();
				if (sec){
					last_first_is_true = first;
					return true;
				}
      }else{
    		last_first_is_true  = first;
    		return false;
			}
		}

	}).do(callback);
}



function start_condition(condition){
	
	handle_count++;
	
	let times_eval_called = 0;
	let times_action_called = 0;
	
	let the_handle = setInterval(function(){

		if (times_eval_called < condition.eval_limit && times_action_called < condition.action_limit ){
			times_eval_called++;

			var condition_eval = condition.evaluator(condition.data);

			// if object we assume it's a promise of type { result: true/false, values }
			if (typeof (condition_eval) === typeof({})){
				condition_eval.then((value)=>{
					condition.value = value.result;
					if (value.result){
						times_action_called++;
						condition.action(condition.data);
					}
				}).catch(()=>{
					console.log("unexpected error");
				});
			}else{
				// else it's a function
				condition.value = condition_eval;
				if (condition_eval){
					times_action_called++;
					condition.action(condition.data);
				}
			}
		}else{
			clearInterval(the_handle);
			logic.remove_condition(condition.handle_id);
		}	
	},condition.rate);
	
	condition.state = "active";
	condition.interval_handle = the_handle;	
	return the_handle;
}


logic.remove_condition = function (id){
	const conditions_to_remove = this.conditions.filter((condition) => condition.handle_id === id);
	conditions_to_remove.forEach(condition => clearInterval(condition.interval_handle));
	conditions_to_remove.forEach(condition => condition.state = "stopped");
	this.conditions = this.conditions.filter(condition=> condition.handle_id !== id);
};

// @todo need to make sure we keep eval_limit, action_limit counts and don't mess those up
logic.resume_condition = function(id){
	const conditions_to_resume = this.conditions.filter(condition => condition.handle_id === id);
	conditions_to_resume.forEach(condition => {
		if (condition.state !== "paused") {
    	throw (new Error("cannot resume a condition that is not paused"));
		}
  	start_condition(condition)
	});
};

logic.pause_condition = function(id) {
	var conditions_to_pause= this.conditions.filter(condition => condition.handle_id === id);
	conditions_to_pause.forEach(condition=> {
		  if (condition.state !== "active") {
		  	throw (new Error("cannot pause a condition that is not active"));
		  }
    	clearInterval(condition.interval_handle);
  });
	conditions_to_pause.forEach(condition=> condition.state = "paused");
};

logic.get_state = function(id) {
	var conditions = logic.conditions.filter(condition=> condition.handle_id == id).map(condition => condition.state);
    
	if (conditions.length > 1){
		throw (new Error("logical error, you probably mutated the private state, don't do that"));
	}
	return conditions.length == 1? conditions[0]: null;
};

module.exports = logic;