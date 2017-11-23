# when-do
Utility library used by automate_system to handle scheduling, and rules (primary  use case), and automate_system for sequencing of migration instructions (secondary use case).

Generally, things should be put here if they represent functionality in automate_system that is a more like a utility functionality -- something that exists on its own, does not open any external connections, and potentially is a bit -- not necessarily tricky to code -- but tricky enough -- that including this code in a main project -- which is primarily  state management -- would be dumb as shit.
