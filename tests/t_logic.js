
var assert = require("assert");
var logic = require("../logic.js");

describe('logic - basic evaluation tests', function(){
    
    it ('calls the function if it evaluates to true',function(done){
        
        var value = { val: false };
        logic.when({}, ()=> true).do(()=> { value.val = true});
        
        var promise = get_value_is_true_checker_promise(value);
        
        // pass condition
        promise.then(()=> done());
        
        // fail condition
        promise.catch((reason)=> 
            { 
                assert.fail('pass','fail','value.val was false, should have been set to true')
                done();
            });
    });
  
    it ('does not call the function if it evaluates to false', function(done){
        var value = { val: false };
        logic.when({},()=> false).do(()=> { value.val = true});

        var promise = get_value_is_true_checker_promise(value);

        //fail condition
        promise.then(()=> {
            assert.fail('fail','pass','value.val was true, should have been set to false');
            done();
        });
        
        // pass condition
        promise.catch(() => done());
        
    });

    
});

// returns a promise that checks value.val ever 100 ms for a maximum of 15 tries 
function get_value_is_true_checker_promise (value){

     var the_promise = new Promise(function(resolve, reject){
            var tries = 0;
            var handle = setInterval(()=>{
                if (value.val == true){
                    resolve(value.val);
                }else{
                    tries++;
                }
                if (tries == 10){   // 1.5 seconds maximum
                    reject('callback was never calle');
                }     
            },100);
    });
    return the_promise;
}
