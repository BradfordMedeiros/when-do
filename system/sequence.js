
var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");


var sequence = function(the_path, actions, sequencer){
    
	if (the_path === undefined){
		throw (new Error("the_path undefined in call to sequence"));
	}
	if(actions === undefined){
		throw (new Error("actions undefined in call to sequence"));
	}
	if(sequencer === undefined || typeof(sequencer) !== "function"){
		throw (new Error("sequencer function undefined or not defined as a function in call to sequence"));
	}
 
	var self = this;
	this.path = path.resolve(the_path);
    
	this.get_name = function(state_name){
        // we consider the name the filename but not including the extension (.action.*)
		var base_name = path.basename(this.path);
		return base_name.slice(0,base_name.lastIndexOf(".sequence.")); 
	};
        
	this.execute = ()=>generate_sequence_promise(the_path,actions,sequencer);
    
     
    
};

var generate_sequence_promise = function(sequence_path, system_actions, sequencer){

	var json = JSON.parse(fse.readFileSync(sequence_path));  
	var sequence_actions = json.actions;
    
	var the_sequence_promise = new Promise((resolve,reject)=>{
		var seq = new sequencer();
        
		console.log("sequence actions length ",sequence_actions.length);
		for (var i = 0 ; i < sequence_actions.length ; i++){
			console.log("adding action ",i, sequence_actions[i]);
            
			add_sequence_step(seq, sequence_actions[i], system_actions);
		}
		seq.run().then((status)=>resolve(status)).catch((status)=>reject(status));
	});
	return the_sequence_promise;
};

var add_sequence_step = function(sequencer, action, system_actions){
	var the_action_map = {
		"wait": add_wait_step,
		"action": add_action_step
	};
    
	var add_step = the_action_map[action.name];
	if (add_step === undefined){
		throw (new Error("unsupported action type : ", action.name));
	}else{
		add_step(sequencer, action, system_actions);     
	}
};

var add_wait_step = function(sequencer, action){

	console.log("add wait step");
	console.log(action);
	if (action.value === undefined){
		throw (new Error("no value wait defined"));
	}else{
		var time_to_wait = parseInt(action.value);
		sequencer.wait(time_to_wait);
	}
};

var add_action_step = function(sequencer, action, system_actions){

	console.log("add action step");
    
    // get the individual system action that matches the json action
	var matching_actions  = system_actions.filter (the_action=> the_action.get_name() === action.value);
	if (matching_actions.length !== 1){
		throw (new Error("illegal number of matching action to ",action.get_name()), "actual: ",matching_actions.length);
	}
	var the_system_action = matching_actions[0];
    
    
    // parse the options 
	var has_options = action.options !== undefined;

	var number_of_times_to_loop = 1;
	var delay = undefined;
	if (has_options){
		number_of_times_to_loop = action.options.loop !== undefined? parseInt(action.options.loop) :1;
		delay = action.options.delay; 
        
		console.log("loop is ", number_of_times_to_loop);
		console.log("delay is ", delay);
		if (Number.isNaN(number_of_times_to_loop) || Number.isNaN(delay)){
			throw (new Error("options for action ",action.get_name(), " are invalid"));
		}   
	}
    
    // add to the sequencer
	sequencer.then(()=>the_system_action.execute(action.parameter));
	for (var i =1 ; i < number_of_times_to_loop ; i++){
		if (delay){
			sequencer.wait(delay);
		}
		sequencer.then(()=>the_system_action.execute(action.parameter));
	}
};

sequence.is_sequence = function(sequence_path){
	return is_identifier(sequence_path,"sequence");
};

function is_identifier(path_to_file,type){
	if (type !== "action" && type!== "state" && type!=="condition" && type!=="sequence"){
		throw (new Error("Type: "+type+" is an invalid identifier"));
	}
	var the_file = path.basename(path_to_file);
	var state = the_file.split(".");
    
	return (
        (the_file[0] !== ".") && 
        (the_file[the_file.length-1] !== ".") && 
        state[state.length-2] === type && 
        state.length-2 >0
	);

}


var load_sequence_path = function(sys_sequence_folder, actions ,sequencer){

	if (sys_sequence_folder === undefined || sequencer === undefined){
		throw (new Error("undefined parameters in load sequence path"));
	}       
    
	var sequences = [ ];
    
	var promise = new Promise(function(resolve,reject){
		fse.walk(sys_sequence_folder).on("data",(file)=>{            
			if (sequence.is_sequence(file.path)){
				console.log("added sequence:  "+file.path);
				sequences.push(new sequence(file.path,actions,sequencer));
			}
		}).on("end",()=>{
			console.log("done adding sequences");
			resolve(sequences);
		});
	});
	return promise;

};

module.exports = load_sequence_path;