
var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");


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
    var parameters_to_actions = json.values === undefined? {} : json.values;
    
    this.options = json.options;
    this.is_true = ()=> generate_eval_for_condition(states,json);
    this.actions = the_actions;

    this.execute_actions = ()=>self.actions.forEach((action)=> {
        var parameter = parameters_to_actions[action.get_name()];
        if ( parameter!== undefined){
            action.execute(parameter);
        }else{
            action.execute();
        }
    });
    this.path = path;
};

condition.is_condition = function(condition_path){
    return is_identifier(condition_path,'condition');
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

var load_conditions_path = function(states, actions, sys_condition_folder){
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

module.exports = load_conditions_path;
