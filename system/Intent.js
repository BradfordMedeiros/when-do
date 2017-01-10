
const child_process = require("child_process");
const path = require("path");
const fse = require("fs-extra");



module.exports = intent;

/*

      {
        state: [humidity]
        goal: humidity > 200
        transition:  turn_on_fan


      }

 */