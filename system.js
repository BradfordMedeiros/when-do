
var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");

var action = function (the_path){
	
	var self = this;
	
	this.path = path.resolve(the_path);
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
// maybe allow just a simple json representation instead of an executable as well
// x.state or x.state.y or x.state.json
var state = function (the_path){
	
	var self = this;
	this.path = path.resolve(the_path);
	
	// returns a promise
	this.get_state = function(){	
		var promise = new Promise(function(resolve,reject){
			child_process.execFile(self.path,
            {cwd:self.path+'/..'},
            (err,stdout,stderr)=>{
				console.log('stdout:  '+stdout);
				console.log('error:  ('+err+")");
				console.log('$'+typeof(err));
				console.log('stderr: '+stderr);

				if (err === null){
					resolve(stdout)
				}else{
					reject(stderr);
				}
			});
		});
		return promise;
	};
};

var condition = function(path){
	
	var self = this;
	
	
};

// returns condition based upon the json
function convert_json_to_condition(json_condition){
	
	
}

var system = function(actions, state,conditions){
	
	this.actions = actions;    // path of various actions available
	this.state = state;
	this.conditions = conditions; // path of various conditions available
	
};

/* 
{
	data: [temp, humidity] --> each assumes this topics exist
	
	
	eval: 
		(temp,humdity)=> {
			temp > hum
	
	options: {
		rate:  x,
		action_limit: y
		etc
	}
	
	
}
*/
//////////


// generates a system based upon the path to the root folder
// make into a promise
// need to do a recursive walk of the file system
// make it easy and just name the files x.action.y or x.action

var load_system_from_path = function(sys_when_do_root_folder, callback){
	
	var actions = load_actions_path(path.resolve(sys_when_do_root_folder,'actions'));
	var states = load_states_path (path.resolve(sys_when_do_root_folder,'state'));
	var conditions = load_conditions_path(path.resolve(sys_condition_folder,'conditions'));
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


function is_state(state_path){
    throw (new Error('not implemented'));
}

var load_states_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var states = [ ];
	fse.walk(sys_condition_folder).on('data',(x)=>{
        //basically say if matches
        is_state(x);
    }).on('end',(x)=>{
        
    });
	return states;
}

var load_actions_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var actions = [ ];
	return actions;
};

var t = new state('./mock/states/test.state.bat');
module.exports = {
	action: action,
	state: state,
    t: t
	
};