
/**
        This is the main of the system application.

        This file ties together the various helper libraries and things made
        in the system and serves as a nice cool throwaway main system.

        Cool how we call it app.js instead of main.js now huh?  That's cool man.
        It's so 2016, mobile very cool much wow.

        Steal my code plz.
 **/

var path = require("path");

var APP_FOLDER = path.resolve("../mock/");

var logic = require("../logic.js");
var load_system = require("../system");

var the_system = undefined;

load_system(APP_FOLDER).then((system)=>{
    the_system = system;

    // starts evaluating the conditions and calling them when they become true
    the_system.conditions.forEach(condition=>{
        console.log("Adding condition :"+condition.path);
        logic.when({},condition.is_true).do((x)=>{
            console.log("-----------------------");
            condition.execute_actions(x);
        });
    });
});

