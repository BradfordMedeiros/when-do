
var assert = require("assert");
var system = require("../system.js");

var Condition = system.condition;
var Action = system.action;
var State = system.state;

describe ("state ", function(){
	it ("recognizes valid state names", function(){
		var valid_state_names = [
			"/thing/test/other/thing.state.js",
			"thing.state.js",
			"t.state.js",
			"r.state.do.state.js",
			"thing.state.bat"];
        
		var invalid_state_names = [
			"/thing/test/other/thing.js",
			"thing.js",
			"t.js",
			"/thing/state/other/thing.js",
			"state/thing.js",
			"test/state.js",
			"state.js",
			".state.js",
			"logic.state.",
			"logic.state",
			"logic.state.do.js"
		];
        
		var valid = valid_state_names.map((name)=> State.is_state(name));
		var invalid = invalid_state_names.map((name)=>State.is_state(name));
		assert.deepEqual(valid, valid_state_names.map((state)=>true));
		assert.deepEqual(invalid, invalid_state_names.map((state)=>false));
	});
    
	it("name is the last part of the path not including the extension", function(){
		var the_state = new State("/room1/room2/../room3/./test.path.humidity.state.rb");
		assert.equal(the_state.get_name(),"test.path.humidity");
	});

});

describe ("action ", function(){
	it ("recognizes valid action names", function(){
		var valid_action_names = [
			"/thing/test/other/thing.action.js",
			"thing.action.js",
			"t.action.js",
			"r.action.state.do.action.js",
			"thing.action.bat"];
        
		var invalid_action_names = [
			"/thing/test/other/thing.js",
			"thing.js",
			"t.js",
			"/thing/action/other/thing.js",
			"state/thing.js",
			"test/state.js",
			"action.js",
			"test.condition.js",
			"test.state.js",
			".state.js",
			"logic.action.",
			"logic.action",
			"logic.action.do.js"
		];
        
		var valid = valid_action_names.map((name)=> Action.is_action(name));
		var invalid = invalid_action_names.map((name)=>Action.is_action(name));
		assert.deepEqual(valid, valid_action_names.map((action)=>true));
		assert.deepEqual(invalid, invalid_action_names.map((action)=>false));
	});
});


describe ("condition ", function(){
	it ("recognizes a valid condition name");
});