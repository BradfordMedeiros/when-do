//@todo need to make sure the state in fact outputs valid json and parse it

var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");

var action = function (the_path){
	
	var self = this;
	
	this.path = path.resolve(the_path);
	// returns a promise
	this.execute = function(){
        console.log("Executing action ",self.path);
		var promise = new Promise(function(resolve,reject){
			child_process.execFile(self.path,
            {cwd:self.path+'/..'},
            (err,stdout,stderr)=>{
				//console.log('stdout:  '+stdout);
				//console.log('error:  ('+err+")");
				//console.log('$'+typeof(err));
				//console.log('stderr: '+stderr);

				var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                   
                }catch(e){
                    is_error = true;
                }
				if (err === null && !is_error){
					resolve(json_result)
                    console.log("Finished executing action success ",self.path);
                }else{
					reject(stderr);
                    console.log("Error executing action success ",self.path);

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
				//console.log('stderr: '+stderr);
                //console.log(self.get_name()+' return w/ value: '+stdout);
                console.log("Executing state ",self.path);

                var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                    //console.log("json result is "+json_result);
                }catch(e){
                    is_error = true;
                    console.log("json parse failed");
                }
				if (err === null && !is_error){
					resolve(json_result)
                    console.log("Finished executing state success:  ",json_result," ",self.path);

                }else{
					reject(stderr);
                    console.log("Error executing state success ",self.path);

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

    if (states === undefined){
        throw (new Error("states is not defined in condition"));
    }
    if (actions === undefined){
        throw (new Error("actions is not defined in action "));
    }
    if (path === undefined){
        throw (new Error("path is not defined in condition"));
    }

	var self = this;

    // do this over require because we want users to be able to reload
    // and i don't wanna mess around w/ require cache cause that seems bad
    var json = JSON.parse(fse.readFileSync(path));

	var the_eval = generate_eval_for_condition(states,json);
    var the_actions = get_ordered_actions_from_json_condition(actions,json);

    this.options = json.options;
    this.is_true = ()=> generate_eval_for_condition(states,json);
    this.actions = the_actions;

    this.execute_actions = ()=>self.actions.forEach((action)=> action.execute());
    this.path = path;
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


function generate_eval_for_condition(states, json_condition){

    var ordered_states = get_ordered_states_from_json_condition(states,json_condition);
    var the_eval = eval(json_condition.eval);
        
    // THIS IS THE BAD CODE THE LIMITS THIS TO THREE WHICH IS ABSOLUTE UTTER GARBAGE
    var values = [ ];

    var promises = [ ];
    ordered_states.forEach(
        (state,index)=> {
            var the_promise = state.get_state();
            promises.push(the_promise);
            the_promise.then((val)=> values[index] = val);
        }
    );

    var the_resolver = undefined; 
    var the_rejecter = undefined;
    var public_promise = new Promise(function(resolve,reject){
        the_resolver = resolve;
        the_rejecter = reject;
    });
    
    var private_promise = Promise.all(promises).then(()=>{
         try{
            var result = the_eval.apply(null,values);
            // console.log('val:',values);
            the_resolver({
                result: result,
                values: values
            });
         }catch(e){
            the_rejecter({
                result: result,
                values: values
            });
         }
    });
 
    return public_promise;
    
    
};

// I want to eventually be able to use the whole when_do.js library if appropriate based on this
// for now can only perform basic functionality to do one or more action following the state
function get_ordered_actions_from_json_condition(actions, json_condition){
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

    //console.log('//////////////////////////');
    var resolver = undefined;
    var rejector = undefined;
    var system_loaded_promise = new Promise((resolve,reject)=>{
        resolver = resolve;
        rejector = reject;
    });

    var the_system = new system;

    var actions = load_actions_path(path.resolve(sys_when_do_root_folder,'actions'));
	actions.then((a)=> the_system.actions = a);

    var states = load_states_path (path.resolve(sys_when_do_root_folder,'states'));
	states.then((s)=> the_system.states = s);

    Promise.all([actions,states]).then(()=>{
        //console.log ('states-------------////////////////' ,states);
        var conditions = load_conditions_path(
            the_system.states,
            the_system.actions,
            path.resolve(sys_when_do_root_folder,'conditions'));

        conditions.then((c)=>{
            the_system.conditions = c
            resolver(the_system);
        }).catch(rejector);
    });

    //console.log('-----------------loading system loaded',system_loaded_promise)
    return system_loaded_promise;
};

// --------- these should be private
// returns conditions
var load_conditions_path = function(states,actions, sys_condition_folder){
    if (states === undefined){
        throw (new Error("states undefined while loading conditions"));
    }
    if (actions === undefined){
        throw (new Error("actions undefined while loading conditions"));
    }
    if (sys_condition_folder === undefined){
        throw (new Error("sys_condition_folder is undefined while loading conditions"));
    }

	var conditions = [ ];

    var conditions_promise = new Promise (function(resolve,reject){
       fse.walk(sys_condition_folder).on("data",(file)=>{
           if (condition.is_condition(file.path)){
               console.log("added condition:  "+file.path);
               conditions.push(new condition(states,actions,file.path));
           }else{
               console.log("did not add state: "+file.path);
           }
       }).on("end",()=>{
           console.log("done adding conditions");
           resolve(conditions);
       });
    });
	return conditions_promise;
};

// return a promise whose states are passed as an array in
var load_states_path = function(sys_condition_folder){
	var states = [ ];
    
    var promise = new Promise(function(resolve,reject){
        fse.walk(sys_condition_folder).on('data',(file)=>{
            //console.log('-#-'+state.is_state);
            
            if (state.is_state(file.path)){
                //console.log('added state:  '+file.path);
                states.push(new state(file.path));
            }else{
                console.log('did not add state: '+file.path);
            }
        }).on('end',()=>{
            //console.log('done adding states');
            resolve(states);
        });
    });
	return promise;
}

var load_actions_path = function(sys_condition_folder){
	var actions = [ ];
    
    // console.log('--'+action.is_action);
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


// http://stackoverflow.com/questions/11775884/nodejs-file-permissions
var PERMISSION_CONSTANTS = {
    "can_read": 4,
    "can_write": 2,
    "can_execute": 1
}

var check_permission = function (file, mask){
    return new Promise(function(resolve,reject){
        fs.stat (path.resolve(file), function (error, stats){
            if (error){
                reject();
            }else{
                resolve(!!(mask & parseInt ((stats.mode & parseInt ("777", 8)).toString (8)[0])));
            }
        });
    });   
};

var can_read_file = function(file){
    return check_permission(file,PERMISSION_CONSTANTS["can_read"]);
};

var can_write_file = function(file){
    return check_permission(file,PERMISSION_CONSTANTS["can_write"]);
};

var can_execute_file = function(file){
    return check_permission(file,PERMISSION_CONSTANTS["can_execute"]);
};

// Returns json result from the file
// Executes file if it's executable, else reads it
// Expects contents to be json file
var generate_json_result_from_file = function(file){
   
    var can_execute = can_execute_file(file);
    can_execute.then((is_executable)=>{
        if(is_executable){
            return new Promise(function(resolve,reject){
                child_process.execFile(self.path,
                    {cwd:self.path+'/..'},
                    (err,stdout,stderr)=>{
                    //console.log('stderr: '+stderr);
                    //console.log(self.get_name()+' return w/ value: '+stdout);
                    console.log("Executing state ",self.path);

                    var is_error = false;
                    try{
                        var json_result = JSON.parse(stdout);
                        //console.log("json result is "+json_result);
                    }catch(e){
                        is_error = true;
                        console.log("json parse failed");
                    }
                    if (err === null && !is_error){
                        resolve(json_result)
                        console.log("Finished executing state success:  ",json_result," ",self.path);

                    }else{
                        reject(stderr);
                        console.log("Error executing state success ",self.path);
                    }
                });
            });
        }else{
            console.log('not execuable');
        }
    });
    can_execute.catch(()=>{
        console.log("error in generate_json_result_from_file");
       
    });
    
};

module.exports =  { 
    load_system_from_path: load_system_from_path,
    action: action,
    state: state,
    condition: condition,
    generate_json_result_from_file:generate_json_result_from_file,
    can_execute_file: can_execute_file,
    can_read_file: can_read_file
}
    