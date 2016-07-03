
var assert = require("assert");
var system = require("../system.js");

var Condition = system.condition;
var Action = system.action;
var State = system.state;

describe ('state ', function(){
    it ('recognizes valid state names', function(){
        var valid_state_names = [
        '/thing/test/other/thing.state.js',
        'thing.state.js',
        't.state.js',
        'r.state.do.state.js',
        'thing.state.bat']
        
        var invalid_state_names = [
        '/thing/test/other/thing.js',
        'thing.js',
        't.js',
        '/thing/state/other/thing.js',
        'state/thing.js',
        'test/state.js',
        'state.js',
        '.state.js',
        'logic.state.',
        'logic.state',
        'logic.state.do.js'
        ]
        
        var valid = valid_state_names.map((name)=> State.is_state(name));
        var invalid = invalid_state_names.map((name)=>State.is_state(name));
        assert.deepEqual(valid, valid_state_names.map((state)=>true));
        assert.deepEqual(invalid, invalid_state_names.map((state)=>false));
    });
});

describe ('condition ', function(){
    it ('recognizes a valid condition name');
});