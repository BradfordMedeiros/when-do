
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

action.is_action = function(action_path){
    throw (new Error('not implemented'));
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

state.is_state = function(state_path){
    var the_file = path.basename(state_path);
    var state = the_file.split('.');
    
    return (
        (the_file[0] !== '.') && 
        (the_file[the_file.length-1] !== '.') && 
        state[state.length-2] === 'state' && 
        state.length-2 >0
        );
};


var condition = function(path){
	
	var self = this;
	
	
};

condition.is_condition = function(condition_path){
    throw (new Error('not implemented'));
};

// returns condition based upon the json
function convert_json_to_condition(json_condition){
	throw (new Error('not implemented'));
}

var system = function(actions,states,conditions){
	
	this.actions = actions;    // path of various actions available
	this.states = states;
	this.conditions = conditions; // path of various conditions available
};


// generates a system based upon the path to the root folder
// make into a promise
// need to do a recursive walk of the file system
// make it easy and just name the files x.action.y or x.action

var load_system_from_path = function(sys_when_do_root_folder){
    
	//var actions = load_actions_path(path.resolve(sys_when_do_root_folder,'actions'));
	var states = load_states_path (path.resolve(sys_when_do_root_folder,'states'));
	//var conditions = load_conditions_path(path.resolve(sys_condition_folder,'conditions'));
	var new_system = new system(undefined,states,undefined);
    
    var promise = new Promise((resolve,reject)=>{
        states.then((loaded_states)=>{
            new_system.states = loaded_states;
            resolve(new_system);
        });
       
    });
    return promise;
};

// --------- these should be private
// returns conditions
var load_conditions_path = function(sys_condition_folder){
	throw (new Error("not yet implemented"));
	var conditions = [ ];
	
	return conditions;
};



// return a promise whose states are passed as an array in
var load_states_path = function(sys_condition_folder){
	var states = [ ];
    
    console.log('--'+state.is_state);
    var promise = new Promise(function(resolve,reject){
        fse.walk(sys_condition_folder).on('data',(file)=>{
            console.log('-#-'+state.is_state);
            
            if (state.is_state(file.path)){
                console.log('added state:  '+file.path);
                states.push(new state(file.path));
            }else{
                console.log('did not add state: '+file.path);
            }
        }).on('end',()=>{
            console.log('done adding states');
            resolve(states);
        });
    });
	return promise;
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
    t: t,
    load_states_path: load_states_path,
    load_sys: load_system_from_path
	
};