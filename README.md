[![Build Status](https://travis-ci.org/haschdl/SuperMidiJS.svg?branch=master)](https://travis-ci.org/haschdl/SuperMidiJS) 
[![npm version](https://badge.fury.io/js/supermidijs.svg)](https://badge.fury.io/js/supermidijs) 
[![Coverage Status](https://coveralls.io/repos/github/haschdl/SuperMidiJS/badge.svg?branch=master)](https://coveralls.io/github/haschdl/SuperMidiJS?branch=master)

# SuperMidiJS

Use MIDI controllers to add interactivity to your creative coding projects. `SuperMidiJS` simplifies the process by mapping MIDI messages as pads and 
sliders to javascript applications. Via a configuration form, the library 
can be configured to work with **any** MIDI controller.

Looking for contributors! [Create an issue](https://github.com/haschdl/SuperMidiJS/issues/new) if you're interested in collaborating.

# Installation

From NPM:  

  ```
  npm install supermidijs
  ````

A quick-example is available at `/dist/example/SuperMidi.html`.

For a manually installation, download [`/dist/lib/SuperMidi.js`](/dist/lib/SuperMidi.js) or the minified version [`/dist/lib/SuperMidi.min.js`](/dist/lib/SuperMidi.min.js).


# Getting started

The library is primarily focused on interactive projects which could MIDI devices as a means of 
capturing input from users. It exposes pads and sliders objects, which you can attach to your 
code as boolean or float values.

``` Javascript
if (controller.padSet.pads[1].state == true) {
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
![SuperMIDIJS Configuration form](docs/2018-11-10-12-42-19.png)

# Mapping

Once device info is populate, select one the pads, and tap on the MIDI controller key 
you want to associate with that PAD. You can continuously press other keys, and the form will move to the next available key.
![](docs/2018-11-10-12-44-04.png)

# Save

Once you are done with the mappings, hit Submit. The mapping will be saved in your local storage, and will be reloaded next time you use SuperMIDIJS with that specific controller.

![](docs/2018-11-10-12-47-25.png)

## Features / wish-list  

[x] Creative coders can customize the mapping between the physical controller and the logical objects  
[x] Provide a predefined, configurable list of `PADS`  
[ ] Provide a predefined, configurable list of `KNOBS` or `SLIDERS`  
[ ] Configurations for common devices can be crowd-sourced and published

## Feedback

Please submit your questions and feedback via a [Github issue](https://github.com/haschdl/SuperMidiJS/issues/new).