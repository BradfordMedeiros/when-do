# when-do

The idea of this library is to be able to construct extend if statements to a when statement so that we can say things like:

current support:

english: when it is cold outside, turn on the heater
and in code:
<code>
  <pre>
  thermometer_data = { temperature:20 }
  logic.when(thermometer_data, function(data){ return data.temperature < 30}).do(turn_on_heater)
  </pre>
</code>we may also modify the above as:<code><pre>...do(turn_on_heater, options)</pre>
</code>where options may optionally specify any of the below:
<code><pre>options = 
```{
  rate: <value>, // specifies the interval in ms that the evaluator function should be called. 
                // When the evaluator returns true, we will call the action function
  eval_limit: <value>, // the number of times to evaluate the function 
  action_limit: <value> // the number of times to perform the action, for example we may set it to 1 so the action only occurs once
  
}```</pre></code>
additionally, we may do the following operations:
<code><pre>handle = logic.when(eval).do(action)
handle.stop() // removes the condition.  When a handle is stopped you must create a new one.  It is now invalid.
</pre>
</code>and the pair:
<code><pre>handle.pause() // pauses any evaluation of the condition, maintains any state of the eval such as limits
handle.resume()</pre>
</code>
<hr>
Upcoming:
- Next up is to refactor code because i just hacked it into one file, all unorganized to get it working

Upcoming support:
additional functions:

<code>
logic.when(eval).do_once(action) ==> convenience function which simply passes an options argument with argument 1. This will override                                     any options passed into the function (debating if this is a good idea or not)
</code>

chaining:
logic.when(eval).do(x).do(y) ==> where if the eval is true is will call all methods after it

additional logic:
<code><pre>logic.when(logic.and(eval0,eval1)).do(action) ==> logical and operation
logic.when(logic.or(eval0,eval1)).do(action) ==> logical or operation</pre>
</code>

syntax might change but something like:<code>handle = logic.when(eval).do(action)
logic.when(handle).do(action1)
</code>

so you can do something like:
in english: when it's night turn off the lights.  when the lights are turned off, turn on smooth jazz music;
in code:

<code>night_turn_off_light_handle = logic.when(data,is_night).do(turn_of_lights)
logic.when(night_turn_off_light_handle).do(play_smooth_jazz);
</code>>

I also want to be able to do chaining for these.  I am not 100% sure how or conditions should be evaluated for these, considering 
these get evaluated on different intervals.  I am thinking about a mandatory specifier such as:

<code>
logic.when(night_turn_off_light_handle).andwithin(play_smooth_jazz,30000).do(action).  We will see.
</code>
     
     
also need to figure out this markdown
