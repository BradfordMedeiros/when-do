
var assert = require("assert");
var logic = require("../rules/rules.js");

describe("logic - basic evaluation tests", function(){
    
	it ("calls the function if it evaluates to true",function(done){
        
		var value = { val: false };
		logic.when({}, ()=> true).do(()=> { value.val = true;},{rate: 10});
        
		var promise = get_value_is_true_checker_promise(value);
        
        // pass condition
		promise.then(()=> done());
        
        // fail condition
		promise.catch((reason)=> 
            { 
			assert.fail("pass","fail","value.val was false, should have been set to true");
			done();
		}
        );
	});
  
	it ("does not call the function if it evaluates to false", function(done){
		var value = { val: false };
		logic.when({},()=> false).do(()=> { value.val = true;},{rate: 10});

		var promise = get_value_is_true_checker_promise(value);

        //fail condition
		promise.then(()=> {
			assert.fail("fail","pass","value.val was true, should have been set to false");
			done();
		});
        
        // pass condition
		promise.catch(() => done());
        
	});

	it ("passes in the reference to the data to the condition", function(done){
		var value = { val: false };
		var condition = { count: 0 };
		logic.when(condition, (condition)=> {
			var is_true = condition.count == 2;
			condition.count++;
			return is_true;
		}).do(()=> value.val = true,{rate: 10});
        
		var promise = get_value_is_true_checker_promise(value);
        
        // pass condition
		promise.then(()=> done());
        
        // fail condition
		promise.catch((reason)=> 
            { 
			assert.fail("pass","fail","value.val was false, should have been set to true");
			done();
		}
        );
	});


	it ("passes in the reference to the data to the callback", function(done){

		var value = { val: false, count: 0 };
		logic.when(value, ()=> true).do((the_value)=> { the_value.count = 1; the_value.val = true;},{rate: 10});
        
		var promise = get_value_is_true_checker_promise(value);
        
        // pass condition
		promise.then(()=> {
			assert.equal(value.count,1);
			done();
		});
        
        // fail condition
		promise.catch((reason)=> 
            { 
			assert.fail("pass","fail","value.val was false, should have been set to true");
			done();
		}
        );
	});
});

describe("logic - evaluation tests for function returning promises (instead of true/false)", function(){
	it ("calls the function if the promise evaluates to true", function(done){
		var value = { val: false };
		logic.when({}, ()=> new Promise(function(resolve,reject){
			resolve({
				result: true,
				values: [ ]
			});
		})).do(()=> { value.val = true;},{rate: 10});
        
		var promise = get_value_is_true_checker_promise(value);
        
        // pass condition
		promise.then(()=> done());
        
        // fail condition
		promise.catch((reason)=> 
            { 
			assert.fail("pass","fail","value.val was false, should have been set to true");
			done();
		}
        );
	});
	it ("does not call the function if the promise evaluates to false");
   
});

describe ("logic - optional parameters", function(){
	it ("optional limit of the number of times to evaluate the condition");
	it ("optional limit for the number of times to call the action");
	it ("has a function shortcut to call the rate limit with value of once which takes precedence over the options");
	it ("optional specifier for the rate to evaluate conditions");
    
});


// returns a promise that checks value.val ever 100 ms for a maximum of 15 tries 
function get_value_is_true_checker_promise (value){

	var the_promise = new Promise(function(resolve, reject){
		var tries = 0;
		var handle = setInterval(()=>{
			if (value.val == true){
				clearInterval(handle);
				resolve(value.val);
			}else{
				tries++;
			}
			if (tries == 5){   // 1.5 seconds maximum
				clearInterval(handle);
				reject("callback was never calle");
			}     
		},10);
	});
	return the_promise;
}
