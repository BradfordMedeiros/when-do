
var child_process = require("child_process");

var action = function (path){
	
	var self = this;
	
	this.path = path;
	this.execute = function(){
		child_process.execFile(self.path,(err,stdout,stderr)=>{
			console.log('stdout:  '+stdout);
			console.log('error:  '+err);
			console.log('stderr: '+stderr);
		});
	};
};



// figure out best way to handle this
// state should be valid json (so then we can do easy number comparisons)
var state = function (path, callback){
	
	var self = this;
	this.path = path;
	
	this.get_state = function(){
		
		var promise = new Promise(function(resolve,reject){
			
			child_process.execFile(self.path,(err,stdout,stderr)=>{
			console.log('stdout:  '+stdout);
			console.log('error:  '+err);
			console.log('stderr: '+stderr);
			var result = stdout;
			resolve(result);
			
		});
		
		promise.resolve(()=>{
			return 
				
		});
		
	};
};

var system = function(actions, state,conditions){
	
	this.actions = actions;    // path of various actions available
	this.state = state;
	this.conditions = conditions; // path of various conditions available
	
};


// generates a system based upon the path to the root folder
// make into a promise
// need to do a recursive walk of the file system
// make it easy and just name the files x.action.y or x.action

var load_system from_path = function(sys_when_do_root_folder, callback){
	
	var actions = load_actions_path(sys_when_do_root_folder+'/actions');
	var states = load_states_path (sys_when_do_root_folder+'/state');
	var conditions = load_conditions_path(sys_condition_folder+'/conditions');
	var new_system = new system(actions,conditions);
	callback(new_system);
	
};

// --------- these should be private
// returns conditions
var load_conditions_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var conditions = [ ];
	
	return conditions;
};

var load_states_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var states = [ ];
	
	return states;
}

var load_actions_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var actions = [ ];
	return actions;
};


