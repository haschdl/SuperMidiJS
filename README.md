# SuperMidiJS

Use MIDI controllers to quickly build interactive web-based applications. `SuperMidiJS` simplifies 
the process by mapping MIDI messages as pads and sliders to javascript applications. Via a 
configuration form, the library can be configured to work with **any** MIDI controller.

   | Currently looking for contributors. Create an issue if you're interested in collaborating.

# Features / wish-list 

[x] Creative coders can customize the mapping between the physical controller and the logical objects 
[x] Provide a predefined, configurable list of `PADS`
[ ] Provide a predefined, configurable list of `KNOBS` or `SLIDERS`
[ ] Configurations for common devices can be crowd-sourced and published

# Applications

The library is primarily focused on interactive projects which could MIDI devices as a means of 
capturing input from users. It exposes pads and sliders objects, which you can attach to your 
code as boolean or float values.

``` Javascript
if (controller.padSet.pads[1].status == true) {
   strokeWeight(2);
   stroke(0);
   fill(255, 0, 0);
   rect(s * 2 * i, 50, s, s);
} else {
   noFill();
   rect(s * 2 * i, 50, s, s);
}
```

# Basic information about MIDI devices 
MIDI devices communicate by sending short messages to computers. The MIDI protocol was designed for music applications, therefore the messages might represent music notes, or control messages. Most devices offer a way to choose which notes are sent when certain buttons are pressed. Specialized software for music, known as [DAW](https://en.wikipedia.org/wiki/Digital_audio_workstation), typically has built-in configurations to assign notes and control messages to certain commands.


# Configuration
If a pre-defined mapping is not available, the library will load a configuration form. 

## Device information
As soon as you plug a MIDI controller, the form will fill-up the manufacturer and port name:
![](docs/2018-11-10-12-42-19.png)

# Mapping
Once device info is populate, select one the pads, and tap on the MIDI controller key 
you want to associate with that PAD. You can continuously press other keys, and the form will move to the next available key.
![](docs/2018-11-10-12-44-04.png)

# Save
Once you are done with the mappings, hit Submit. The mapping will be saved in your local storage,
and will be reloaded next time you use SuperMIDIJS.

![](docs/2018-11-10-12-47-25.png)
