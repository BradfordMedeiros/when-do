# when-do
An engine specifically geared to tooling to create smart home-automation.
Works through file system mounting and configuration, or as node.js libraries.

For example, with smart-home automation, you might want to solve some of the following scenarios:
<pre>
1. When it is dark, turn the light on.
2. When a movie is playing, turn off the lights and then turn on the tv.
</pre>
or you might simply want to provide actions for a user to directly use such as :

<pre>
3. turn the light on
4. turn off the lights, then turn on the tv.
</pre>

<hr>

To achieve we point it at a folder:
<pre>
  /system
    /states
    /actions
    /conditions
    /sequences
</pre>

States and actions are the primary folders. States and actions are the fundamental abilities driving everything else we use.
States and actions describe the state of your smart home system, and actions you might perform respectiviely.  Think of states folder as describing the state of the system , and actions as describing  what your system can do.
<hr>
<br>
Examples of states might be: room_temperature, humidity, is_nighttime, etc.
<br>
Examples of actions might be: set_room_temperature, turn_on_humidifier, etc.

<br>
<hr>
 I recommend taking advantage or the filesystem and other tooling the OS provides with this structure.
 For example, by creating folders, we can organize something like:
 <pre>
 /states
  /indoor
    /room1
      temp.state.json
    /room2
      temp.state.json
  /outdoor
      is_dog_in_doghouse.state.exe
      /treehouse
        treehouse_temp.state.json
        treehouse_humidity.state.exe
 /actions
  /outdoor
      /treehouse
        turn_on_fan.exe
  /indoor
    /room1
      turn_on_fan.exe
    /room2
      turn_on_fan.exe
 </pre>

 By organizing your folder structure like this, it provided additional information. Unfortunately at this time I don't support anything to take advantage of this, but I still find it useful for managing my system.
<br>
Any state is the state folder must be labeled *.state.*and any action must be named*.state.*.
Two formats are supported.  These may either be executable files or json.  If it is json, the state will be read an parsed from the json file directly, and actions will right to this json file directly (you may implement a file watch or pipe to get this value elsewhere to another program).  If it a program, it will run the program, and read from stdin for states, and write via parameters to stdin for actions.

<br> * Note that when conditions are evaluated, they do so in a loop based upon the condition configuration.  Just be aware that these programs/files may be read quite often (1000 ms default evaluation for the loop).  These programs should be short quick programs.

<hr>
Sequences are effectively like actions, but are specified as a json file which combined the actions in a certain order.   They support looping actions, and delays.
<br>
Conditions are specified as json, and specify that an action should be performed when a certain evaluation is true.  I allow the use to write a javascript snippet that will be evaluated in the json. The state you wish to monitor may be passed in and the action will then be performed when that is true.
<br>
And example configuration is provided in the mock folder.  That is probably the easiest way to learn what I am trying describe in this hastily written read-me.

I also provide support to the underlying logic (condition) engine, and the sequencer:


and in code:
<code>
  <pre>
  const thermometer_data = { temperature:20 }
  const handle = logic.when(thermometer_data, function(data){ return data.temperature < 30}).do(turn_on_heater)
  </pre>
</code>

we may also modify the above as:
<code>
  <pre>...do(turn_on_heater, options)</pre>
</code>where options may optionally specify any of the below:
<code>
  <pre>
  options =
```javascript

  rate: <value>, // specifies the interval in ms that the evaluator function should be called.
                // When the evaluator returns true, we will call the action function
  eval_limit: <value>, // the number of times to evaluate the function
  action_limit: <value> // the number of times to perform the action, for example we may set it to 1 so the action only occurs once

```
</pre>
</code>
additionally, we may do the following operations:
  <code>

    handle = logic.when(eval).do(action)
    ```

  and the pair:

      handle.pause() // pauses any evaluation of the condition, maintains any state of the eval such as limits
      handle.resume()
  <hr>
    </code>



