

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

var handle_count = 0

var logic = {
	type : 'logic',
    conditions : [ ],
    
    when: function(data, evaluator){
    	this.type = 'when';
        return new execute(data,evaluator)
    }
};



function execute(data, evaluator){
	this.data = data;
	this.evaluator = evaluator;
	this.type = 'do';
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

	start_condition(condition);
	return new handle(condition.handle_id);
};


function start_condition(condition){
	handle_count++;
	
	var times_eval_called = 0;
	var times_action_called = 0;
	
	var the_handle = setInterval(function(){

		if (times_eval_called < condition.eval_limit && times_action_called < condition.action_limit ){
			times_eval_called++;
			
			if (condition.evaluator(condition.data)){
				times_action_called++;
				condition.action(condition.data);
			}
		}else{
			clearInterval(the_handle);
            logic.remove_condition(condition.handle_id);
		}	
	},condition.rate);
	
	condition.state = 'active';
	condition.interval_handle = the_handle;	
	logic.conditions.push(condition);
	return the_handle;
};



logic.remove_condition = function (id){
	console.log('removing '+id)
	var conditions_to_remove = this.conditions.filter(condition => condition.handle_id === id);
	
	conditions_to_remove.forEach(condition=> clearInterval(condition.interval_handle))
	conditions_to_remove.forEach(condition=> condition.state = 'stopped');
	
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
	var conditions = logic.conditions.filter(condition=> condition.handle_id == id).map(condition => condition.state);
    
    if (conditions.length > 1){
		throw (new Error("logical error, you probably mutated the private state, don't do that"));
	}
	return conditions.length == 1? conditions[0]: null;
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
handle.prototype.get_state = function(){
    var state = get_state(this.id);
    return state == null? 'stopped': state;
};

module.exports = logic;