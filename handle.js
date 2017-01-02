

var handle = function(logic, id){
	if (logic === undefined || id===undefined){
		throw (new Error("undefined parameters"));
	}
	this.logic = logic;
	this.id = id;
};
handle.prototype.stop = function(){
	this.logic.remove_condition(this.id);
};
handle.prototype.resume = function(){
	this.logic.resume_condition(this.id);
};
handle.prototype.pause = function(){
	this.logic.pause_condition(this.id);
};
handle.prototype.get_state = function(){
	var state = this.logic.get_state(this.id);
	return state == null? "stopped": state;
};



module.exports = handle;