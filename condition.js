

//logic.when( logic.and(1,humidity_is_high, it_is_night)).do(x)


var condition = function(get_value){
    this.eval = ()=> get_value();
};
condition.prototype.type = 'condition';

var and_condition = function(condition0,condition1){

    var args = arguments;
    this.eval = ()=>{
        var is_true = true;
        for (var i = 0 ; i < args.length; i++){
            if (!args[i].eval()){
                is_true = false;
                break;
            }
        }
        return is_true;
    }

};
and_condition.prototype.type = 'and_condition';

var or_condition = function(condition0,conditionn){
    var is_true = false;
    if (arguments.length === 0){
        throw (new Error("or condition must contain at least one condition"));
    }
  
    this.args = arguments;
    this.eval = ()=>{
        for (var i = 0 ; i < this.args.length; i++){
            var value = this.args[i].eval();
            if (value === true){
                is_true = true
                break;
            }
        }
        return is_true;
    }
};
or_condition.prototype.type = 'or_condition';


var    val0 =  {val:true}
var    val1 =  {val:true}
var    f0 = new condition(()=>val0.val)
var        f1=  new condition(()=>val1.val)
var        oor= new or_condition(f0,f1)
var        aand= new and_condition(f0,f1)

module.exports = {
    condition: condition,
    and: and_condition,
    or: or_condition,
    test: {
        o: oor,
        a: aand,
        v0: val0,
        v1: val1,
        f0:f0,
        f1: f1
    }
};