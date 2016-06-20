

//logic.when( logic.and(1,humidity_is_high, it_is_night)).do(x)


var condition = function(func, get_value){
    this.get_value = get_value;
    this.eval = ()=> this.get_value();
};
condition.prototype.type = 'condition';

var and_condition = function(condition0,condition1){
    this.eval = ()=>{
        var is_true = true;
        for (var i = 0 ; i < arguments.length; i++){
            if (!arguments[i].eval()){
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
        console.log(this.args);
        for (var i = 0 ; i < this.args.length; i++){
            var value = this.args[i].eval();
            console.log('value is '+value);
            if (value === true){
                is_true = true
                break;
            }
        }
        return is_true;
    }
};
or_condition.prototype.type = 'or_condition';

module.exports = {
    condition: condition,
    and: and_condition,
    or: or_condition
};