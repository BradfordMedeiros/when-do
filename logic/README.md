
------------

### Description ###
**Rules** is a utility class to evaluate when certain conditions become true.

Upon calling do the actions will start to be evaluated.  Functions used as evaluators should be pure and lightweight.
The library works internally by calling these functions and evaluating them on a loop. This means it fits certain use
cases well, but is not meant as a replacement for a basic if statement since it is a continuous check.

General pattern is below:
When the evaluator returns true, the function will call function_to_perform.  The object_to_evaluate will then be passed as arguements into the function_to_perform.
Options may be specified that specify the frequency to call the evaluator, rate, action limit, rate limit.  See below for details

### General Usage ###

~~~~
const handle = rules.(evaluator).do(function_to_perform: function, options: object)
~~~~


##### Evaluator Methods #####

~~~~
    when(object_to_evaluate: any, evaluator_function: function<bool>): function // will perform the action when the evaluator is true
    transition(evaluator_function1: function<bool>, evaluator_function2: function<bool>, action: function<any>): function /// will perform the action when the first evaluator is true, and then the second becomes true
    expectWithin(evaluator_function1: function<bool>, evaluator_function2: function<bool>, action: function<any>, resolve, reject): function // when the first condition becomes true, call the resolve callback if the func2 returns true, else call the back callback
~~~~

##### Options Specification #####

~~~~
options = {
    rate: ?Number,                // Rate to evaluate the loop in milliseconds. 
    eval_limit: ?Number =1000,    // Upper bound of the number of times to evaluate the loop.  Object will then be destroyed.
    action_limit: ?Number,        // Upper bound of the number of times to call the action (regardless of truthiness). Object will then be destoryed.
}
~~~~

##### Handle #####
~~~~

const handle = {
    pause: function <void>, // pauses the rule from being evaluated, can be resumed
    resume: function<void>, // resumes a paused rule, can be paused
    stop: function<void>,   // stops a rule, cannot be resumed
    get_state: function<string> // returns state of handle, oneOf(['active', 'paused', 'stopped'])
}
~~~~
