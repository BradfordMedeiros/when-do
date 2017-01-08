var child_process = require("child_process");
var path = require("path");
var fse = require("fs-extra");


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
		return base_name.slice(0,base_name.lastIndexOf(".state.")); 
	};
};

state.is_state = function(state_path){
	return is_identifier(state_path,"state");
};

function is_identifier(path_to_file,type){
	if (type !== "action" && type!== "state" && type!=="condition"){
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
				try{
					value = JSON.parse(value);
					if (error){
						reject(error);
					}else{
            resolve(value);
					}
				}catch(e){
          reject(e);
				}
			});
		});
	}else{
		the_promise = new Promise(function(resolve,reject){
			child_process.execFile(the_path,
				{cwd: path.resolve(the_path, "..")},
				(err,stdout,stderr)=>	{
					let is_error = false;
					try{
						var json_result = JSON.parse(stdout);

					}catch(e){
						is_error = true;
					}

					if (err !== null && !is_error){
						resolve(json_result);
					}else{
					reject(stderr);
				}
			});
		});
	}
	return the_promise;
};


var load_states_path = function(sys_condition_folder){
	var states = [ ];
    
	var promise = new Promise(function(resolve,reject){
		fse.walk(sys_condition_folder).on("data",(file)=>{            
			if (state.is_state(file.path)){
				console.log("added state:  "+file.path);
				states.push(new state(file.path));
			}
		}).on("end",()=>{
			resolve(states);
		});
	});
	return promise;
};

module.exports = load_states_path;

