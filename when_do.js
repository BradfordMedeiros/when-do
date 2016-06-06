

/*logic.set_default_rate(x)
logic.conditions = [ ]
logic.pause(identifier)
logic.resume(identifier)
logic.stop(identifier)
logic.save(conditions)
logic.load(conditions)

logic.when(function(){ return 2==2}).do(
	function(){console.log('hello')}, 
		{
			rate: 200 
			limit: 5
			evaluate: 5000 // check every second (defaults to 1000)
		} 
	);

r = logic.when( logic.and(()=> true,()=>true))).do(()=>{}))
r.stop()
r.pause()
r.resume()

logic.when(object, eval(object)).do()

data = { humidity: 10}
logic.when(data, function(){},

logic.when(object, logic.lessthan({humidity:3})*/

function logic(){
	this.type = 'logic';

};

logic.conditions = [ ];
handle_count = 0

logic.when = function(data, evaluator){
	this.type = 'when';
	return new execute(data,evaluator)
};

function execute(data, evaluator){
	this.data = data;
	this.evaluator = evaluator;
	this.type = 'do';
};


// have function call setinterval and the eval of the data
// check stoppage conditions
/*
	options = { 
		rate = 1000 // how fast to evaluate in ms
		eval_limit = 3 // limit of number of times to call the eval_func
		action_limit = 10 // limit 
	}
	
*/
function start_condition(condition){
	handle_count++;
	
	var times_eval_called = 0;
	var times_action_called = 0;
	
	var the_handle = setInterval(function(){
		console.log("action limit "+condition.action_limit)
		console.log("eval limit "+condition.eval_limit)
		console.log("times eval called"+times_eval_called)
		console.log("times action called "+times_action_called)
		if (times_eval_called < condition.eval_limit-1 && times_action_called < condition.action_limit-1 ){
			times_eval_called++;
			
			if (condition.evaluator(condition.data)){
				times_action_called++;
				condition.action(condition.data)
			}
		}else{
			clearInterval(the_handle)
		}	
	},condition.rate);
	
	condition.state = 'active';
	condition.interval_handle = the_handle;	
	logic.conditions.push(condition);
	return the_handle;
};


execute.prototype.do = function(action,options){
	var that = this
	
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
		state: undefined
	};

	

	start_condition(condition)
	
	return new handle(condition.handle_id);
};

logic.remove_condition = function (id){
	console.log('removing '+id)
	var conditions_to_remove = this.conditions.filter(condition => condition.handle_id === id);
	
	conditions_to_remove.forEach(condition=> clearInterval(condition.interval_handle))
	conditions.to_remove.forEach(condition=> condition.state = 'stopped');
	
	this.conditions = this.conditions.filter(condition=> condition.handle_id !== id)
	
};

// @todo need to make sure we keep eval_limit, action_limit counts and don't mess those up
logic.resume_condition = function(id){
	console.log('resuming '+id)

	var conditions_to_remove = this.conditions.filter(condition => condition.handle_id === id);
	
	conditions_to_remove.forEach(condition=> clearInterval(condition.interval_handle))
	conditions.to_remove.forEach(condition=> condition.state = 'stopped');
};

logic.pause_condition = function(id){
	console.log('pasuing '+id)
	var conditions_to_pause= this.conditions.filter(condition => condition.handle_id === id);
	conditions_to_remove.forEach(condition=> clearInterval(condition.interval_handle))
	conditions.to_remove.forEach(condition=> condition.state = 'paused');
};

logic.get_state = function(id){
	var conditions = logic.conditions.filter(condition=> condition.handle_id == id).map(condition => return condition.state);
	if (conditions.length > 1){
		console.log('warning length is larger than one');
	}
	return conditions[0];
};


var handle = function(id){
	this.id = id;
};
handle.prototype.stop = function(){
	logic.remove_condition(this.id)
};
handle.prototype.resume = function(){
	logic.resume_condition(this.id)
};
handle.prototype.pause = function(){
	logic.pause_condition(this.id)
};

// IF NOT IN LIST WE SAY STOPPED
handle.prototype.get_state = function(){
	return logic.get_state(this.id);
}

