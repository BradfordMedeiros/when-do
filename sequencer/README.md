# *when_do --> sequencer* #
------------

### Description ###
**Sequencer** is a utility class uses to string together functions a declare when they should happen.
Upon calling run the actions will be executed as specified, and a promise returns that will be resolved when all actions have finished executing.

Usage:
arguments:
functions:   The object that can be chained looks like below:
~~~~
sequencer() // -> returns a command that can be chained. below
...
{
    then(function_to_run:function, ?number_of_times_to_run =1:number, ?delay_in_ms = 0:number): object, // batches a command to execute
    wait(time_to_wait_in_ms: number): object,   // adds a wait command to execute
    hold() : object // waits for promise to resolve
    run(): Promise<void>   // runs the commands.  Promise resolves when batch is finishes.
}
~~~~

Examples:
----
Ex1. Basic usage  Prints 'hello world' 50 times, with 1 second delay in between each call
~~~~
const sequencer = require("when_do").sequencer;
sequencer().then(() => console.log('hello world', 50, 1000)).run();
~~~~

----
Ex2. Simple wait : Waits 5 seconds, and then uses the returned promise to display an alert to the user
~~~~
const sequencer = require("when_do").sequencer;
sequencer().wait(5000).run().then(() => window.alert('hello'));
~~~~

Ex3.  Wait for network request, and then wait for 10 seconds, and run.
~~~~
const sequencer = require("when_do").sequencer;
sequencer().hold(fetch(URL)).wait(1000 * 10).then(() => console.log('waited 10 seconds after network request').run();
~~~~
