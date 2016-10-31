//@todo need to make sure the state in fact outputs valid json and parse it

var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");
var sequencer = require("../sequencer.js");

var load_actions_path = require("./action.js");
var load_states_path = require("./state.js");
var load_conditions_path = require("./condition.js");
var load_sequences_path = require("./sequence.js");


var system = function(actions,states,conditions, sequences){
	
	this.actions = actions;    // path of various actions available
	this.states = states;
	this.conditions = conditions; // path of various conditions available
    this.sequences = sequences;
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
    
    // we need to load states and actions before we can load conditions since conditions 
    // are directly dependent on states and actions
    Promise.all([actions,states]).then(()=>{
        var conditions = load_conditions_path(
            the_system.states,
            the_system.actions,
            path.resolve(sys_when_do_root_folder,'conditions'));

        conditions.then((c)=>{
            the_system.conditions = c
         
        }).catch(rejector);
        
        var sequences = load_sequences_path(
           path.resolve(sys_when_do_root_folder, "sequences"),
           the_system.actions,
           sequencer);
           
        sequences.then((s)=>{
            the_system.sequences = s;
        }).catch(rejector);
        
        Promise.all([conditions, sequences]).then(()=>resolver(the_system));
    });
    return system_loaded_promise;
};


module.exports = load_system_from_path;
    