//@todo need to make sure the state in fact outputs valid json and parse it

var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");

var action = function (the_path){
	
	var self = this;
	
	this.path = path.resolve(the_path);
	// returns a promise
	this.execute = function(){	
		var promise = new Promise(function(resolve,reject){
			child_process.execFile(self.path,
            {cwd:self.path+'/..'},
            (err,stdout,stderr)=>{
				console.log('stdout:  '+stdout);
				console.log('error:  ('+err+")");
				console.log('$'+typeof(err));
				console.log('stderr: '+stderr);

				var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                   
                }catch(e){
                    is_error = true;
                }
				if (err === null && !is_error){
					resolve(json_result)
				}else{
					reject(stderr);
				}
			});
		});
		return promise;
	};
    
    this.get_name = function(state_name){
        // we consider the name the filename but not including the extension (.action.*)
        var base_name = path.basename(this.path);
        return base_name.slice(0,base_name.lastIndexOf('.action.')); 
    };
};

action.is_action = function(action_path){
    return is_identifier(action_path,'action');
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
				console.log('stderr: '+stderr);
                console.log(self.get_name()+' return w/ value: '+stdout);
                
                var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                    console.log("json result is "+json_result);
                }catch(e){
                    is_error = true;
                    console.log("json parse failed");
                }
				if (err === null && !is_error){
					resolve(json_result)
				}else{
					reject(stderr);
				}
			});
		});
		return promise;
	};
    
    this.get_name = function(state_name){
        // we consider the name the filename but not including the extension (.state.*)
        var base_name = path.basename(this.path);
        return base_name.slice(0,base_name.lastIndexOf('.state.')); 
    };
};

function is_identifier(path_to_file,type){
    if (type !== 'action' && type!== 'state' && type!=='condition'){
        throw (new Error("Type: "+type+" is an invalid identifier"));
    }
    var the_file = path.basename(path_to_file);
    var state = the_file.split('.');
    
    return (
        (the_file[0] !== '.') && 
        (the_file[the_file.length-1] !== '.') && 
        state[state.length-2] === type && 
        state.length-2 >0
        );

};
state.is_state = function(state_path){
    return is_identifier(state_path,'state');
};



var condition = function(states,actions, path){
	
	var self = this;
    
    var json = require(path);
	var evaluators = generate_eval_for_condition(states,json);
    var actions = get_ordered_actions_from_json_condition(actions,json);
    
    // returns promise that determines if the condition is true or not
    this.is_true = ()=>new Promise((resolve,reject)=>{
        var the_promise = Promise.all(evaluators).then(()=>{
            var truth = [];
            evaluators.forEach((evaluator)=>evaluator.then((val)=>truth.push(val)));
            console.log('truth is ');
            console.log(truth);
            var is_true = truth.filter((val)=> val === true).length === truth.length;
            resolve(is_true);
        });
    });
  

    
};

condition.is_condition = function(condition_path){
    return is_identifier(condition_path,'condition');
};

// returns array of the states ordered to pass into eval of the condition
function get_ordered_states_from_json_condition(states, json_condition){
    var desired_states = [].concat(json_condition.state);    
    var ordered_states =  desired_states.map((state)=> {
            var matching_states = states.filter((the_state) => the_state.get_name() == state);
            if (matching_states.length === 0){
                throw (new Error("state named: "+state+" does not exist"));
            }else if (matching_states.length > 1){
                throw (new Error("multiple states matching: "+state+" exist, should be only 1"));
            }
            return matching_states[0];
        });
    return ordered_states;       
};

var print_shitty_code_warning = function(){
        console.log("----------------------------------------");
        console.log("----------------------------------------");
        console.log("----------------------------------------");
        console.log("----------------------------------------");

        console.log("WARNING HACK THIS MUST BE FIXED");
        console.log("WARNING HACK THIS MUST BE FIXED");

        console.log("WARNING HACK THIS MUST BE FIXED");
        console.log("WARNING HACK THIS MUST BE FIXED");
        console.log("----------------------------------------");
};

function generate_eval_for_condition (states, json_condition){
    var json_condition_array = [].concat(json_condition);
    return json_condition_array.map((condition)=>generate_eval_for_single_condition(states,condition));
}

function generate_eval_for_single_condition(states, json_condition){

    if (json_condition.state.length > 2){
        throw (new Error("Error:  currently only support 2 or less states for a condition"));
    }
    var ordered_states = get_ordered_states_from_json_condition(states,json_condition);    
    print_shitty_code_warning();

    var the_eval = eval(json_condition.eval);
        
    // THIS IS THE BAD CODE THE LIMITS THIS TO THREE WHICH IS ABSOLUTE UTTER GARBAGE
    var value1 = undefined;
    var value2 = undefined;
    
    var promises = [ ];
    if (ordered_states[0] !==undefined){
        promises.push(ordered_states[0].get_state().then((val)=>value1= val));
    }
    if (ordered_states[1] !==undefined){
        promises.push(ordered_states[1].get_state().then((val)=>value2= val));
    }
    
    var the_resolver = undefined; 
    var the_rejecter = undefined;
    var public_promise = new Promise(function(resolve,reject){
        the_resolver = resolve;
        the_rejecter = reject;
    });
    
    var private_promise = Promise.all(promises).then(()=>{
         try{
            var result = the_eval(value1,value2);
            the_resolver(result);
         }catch(e){
            the_rejecter(e);
         }
    });
 
    return public_promise;;
    
    
};

function get_ordered_actions_from_json_condition(actions,json_condition){
    var json_condition_array = [].concat(json_condition);
    return json_condition_array.map((condition)=>get_ordered_actions_from_single_json_condition(actions,condition));
}

// I want to eventually be able to use the whole when_do.js library if appropriate based on this
// for now can only perform basic functionality to do one or more action following the state
function get_ordered_actions_from_single_json_condition(actions, json_condition){
    var desired_actions = [].concat(json_condition.action);    
    var ordered_actions =  desired_actions.map((action)=> {
            var matching_actions = actions.filter((the_action) => the_action.get_name() == action);
            if (matching_actions.length === 0){
                throw (new Error("action named: "+action+" does not exist"));
            }else if (matching_actions.length > 1){
                throw (new Error("multiple actions matching: "+action+" exist, should be only 1"));
            }
            return matching_actions[0];
        });
    return ordered_actions;       
};


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
    
	var actions = load_actions_path(path.resolve(sys_when_do_root_folder,'actions'));
	var states = load_states_path (path.resolve(sys_when_do_root_folder,'states'));
	//var conditions = load_conditions_path(path.resolve(sys_condition_folder,'conditions'));
	var new_system = new system(undefined,states,undefined);
    
    var promise = new Promise((resolve,reject)=>{
        var the_states = undefined;
        var the_actions = undefined;
        actions.then((a)=> new_system.actions = a);
        states.then((s)=> new_system.states = s);
        
        Promise.all([states,actions]).then((loaded_states)=>{
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
	var actions = [ ];
    
    console.log('--'+action.is_action);
    var promise = new Promise(function(resolve,reject){
        fse.walk(sys_condition_folder).on('data',(file)=>{
            console.log('-#-'+state.is_state);
            
            if (action.is_action(file.path)){
                console.log('added state:  '+file.path);
                actions.push(new action(file.path));
            }else{
                console.log('did not add action: '+file.path);
            }
        }).on('end',()=>{
            console.log('done adding states');
            resolve(actions);
        });
    });
	return promise;
};

var t = new state('./mock/states/test.state.bat');
module.exports = {
	action: action,
	state: state,
    t: t,
    load_states_path: load_states_path,
    load_sys: load_system_from_path
	
};