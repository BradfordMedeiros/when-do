

// requires --harmony flag

var logic = require("../util/logic.js");

// example creating monitor on data.count.  monitors at default rates
// when we get over 50 we print out values and clear all handles
// note that we only know bounds of when we will evaluate to true since 
// we monitor at 1/sec at default rate and the data count is incrementing 10x/sec
function basic_monitor(){   
    // Create data with count value that increases over time
	var data = { count : 0 };
	var data_handle = setInterval(function(){
		data.count ++;
	},100);

    // This creates a monitor that watches when the count goes over 50
    // It then calls the do function and stops the handle

    // Note: the do function registers the monitor. A statement without a do statement
    // will never be calling.  If you are trying to do this, you probably just want 
    // to create an interval via setInterval

    // Basic usage:
	var the_handle0 = logic.when(data,function(data){
        // be aware that data is the actual reference to data so any side effects done here will effect the object.  
		return data.count > 50; // return true or false
	}).do(function(data){
		console.log("value is : ",data.count);
		the_handle0.stop();  // this will permanently stop the handle from being evaluated.  May not be resumed
		clearInterval(data_handle);
    
        // all handle methods: stop, pause, resume, get_state
        // pause may be resumed via resume
        // states- 'active', 'paused', 'stopped'
	});
}


/*
    You may also optionally pass in extra options as a 2nd parameter.
    If you set limits, note that the monitor will clean itself up, so don't 
    worry about doing anything to clear intervals, garbage collect, etc
    options = { 
        eval_limit: x,  // the maximum # of times we can evaluate truth
                        // default = Infinity
                        
        action_limit: x // the_maximum # of times we can call action on true,
                        // default = Infinity
                        
        rate: x         // the rate at which to evaluate truth
                        // default = 1000 ms
    }
*/
function monitor_with_options1(){
    
	var count = 0;  
	var options = { // will only be evaluated every 100 ms
		rate: 100,
        
	};
    
	var handle = logic.when({}, function(){
		count ++;
		console.log("evaluating");
		return count > 20;
	}).do(function(){ handle.stop();},options);

}

function monitor_with_options2(){
    
	var count = 0;  
	var options = { // will only be evaluated every 100 ms
		rate: 100,
		action_limit:1 // this will effectively call handle.stop()
                        // truth and the do function is called
                        // equivalent to 1 w/o the extra code       
	};
    
	var handle = logic.when({}, function(){
		count ++;
		console.log("evaluating");
		return count > 20;
	}).do(function(){ },options);

}




monitor_with_options2();