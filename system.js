//@todo need to make sure the state in fact outputs valid json and parse it

var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");

var action = function (the_path){
	
	var self = this;
	
	this.path = path.resolve(the_path);
	// returns a promise
	this.execute = (value)=>generate_action_promise(the_path,value);
    
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
	this.get_state = ()=> generate_state_promise(self.path);

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
        
    console.log("gen eval 0");
    var values = [ ];

    var promises = [ ];
    ordered_states.forEach(
        (state,index)=> {
            var the_promise = state.get_state();
            promises.push(the_promise);
            the_promise.then((val)=> values[index] = val);
        }
    );
    console.log("finisihed pushing states");

    var the_resolver = undefined; 
    var the_rejecter = undefined;
    var public_promise = new Promise(function(resolve,reject){
        the_resolver = resolve;
        the_rejecter = reject;
    });
    
    var private_promise = Promise.all(promises).then(()=>{
        console.log("exexuting");
         try{
            var result = the_eval.apply(null,values);
            console.log('val:',values);
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
    }).catch((x)=>{
          console.log("error :",x);
    });
    
    console.log("generated promise");
 
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
        var conditions = load_conditions_path(
            the_system.states,
            the_system.actions,
            path.resolve(sys_when_do_root_folder,'conditions'));

        conditions.then((c)=>{
            the_system.conditions = c
            resolver(the_system);
        }).catch(rejector);
    });
    return system_loaded_promise;
};

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
           }
       }).on("end",()=>{
           console.log("done adding conditions");
           resolve(conditions);
       });
    });
	return conditions_promise;
};

var load_states_path = function(sys_condition_folder){
	var states = [ ];
    
    var promise = new Promise(function(resolve,reject){
        fse.walk(sys_condition_folder).on('data',(file)=>{            
            if (state.is_state(file.path)){
                console.log('added state:  '+file.path);
                states.push(new state(file.path));
            }
        }).on('end',()=>{
            resolve(states);
        });
    });
	return promise;
}

var load_actions_path = function(sys_condition_folder){
	var actions = [ ];
    
    var promise = new Promise(function(resolve,reject){
        fse.walk(sys_condition_folder).on('data',(file)=>{            
            if (action.is_action(file.path)){
                console.log('added action:  '+file.path);
                actions.push(new action(file.path));
            }
        }).on('end',()=>{
            console.log('done adding actions');
            resolve(actions);
        });
    });
	return promise;
};

// Returns json result from the file
// Executes file if it's executable, else reads it
// Expects contents to be json file
var generate_state_promise = function(the_path){
   
    var parts = the_path.split(".");
    var is_json = parts[parts.length-1] === "json";
    
    var the_promise = undefined;
    if (is_json){
        the_promise = new Promise(function(resolve,reject){
            fse.readFile(the_path, "utf-8", (error, value)=>{
                if (error){
                    reject(error);
                }else{
                    resolve(JSON.parse(value));
                }
            });
        });
    }else{
        the_promise = new Promise(function(resolve,reject){
			child_process.execFile(the_path,
            {cwd:the_path+'/..'},
            (err,stdout,stderr)=>{

				var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                   
                }catch(e){
                    is_error = true;
                }
				if (err !== null && !is_error){
                    //console.log("Finished executing state success ",the_path);
					resolve(json_result)
                }else{
                    console.log("Error executing state success ",the_path);
                    console.log("expected json got ",stdout);
					reject(stderr);

                }
			});
		});
    }
    return the_promise;

};


var generate_action_promise = function(the_path, json_value){
    var parts = the_path.split(".");
    var is_json = parts[parts.length-1] === "json";
    
    var the_promise = undefined;
    if (is_json){       
        console.log("writing json file");
        var the_json_value = json_value !== undefined? json_value: "0";
        
        // this should be changed eventually but should be fine for now
        child_process.exec("echo "+the_json_value+" > "+the_path,function(err){
            if (err){
                console.log(err);
            }else{
                console.log("finished writing file ",the_path);
            }
        });
    }else{
        the_promise = new Promise(function(resolve,reject){
			child_process.execFile(the_path,
            {cwd:the_path+'/..'},
            (err,stdout,stderr)=>{

				var is_error = false;
                try{
                    var json_result = JSON.parse(stdout);
                   
                }catch(e){
                    is_error = true;
                }
				if (err === null && !is_error){
                    console.log("Finished executing action success ",the_path);
					resolve(json_result)
                }else{
                    console.log("Error executing action success ",the_path);
                    console.log("expected json got ",stdout);
                    reject(stderr);

                }
			});
		});
        return the_promise;
    }
}


module.exports = load_system_from_path;
    