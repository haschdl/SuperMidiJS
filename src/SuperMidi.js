import {
   PadSet
} from './PadSet.js';

import {
   PAD_MODE
} from './PAD_MODE';

import {
   KnobSet
} from './KnobSet.js';
import {
   Configurator
} from './Configurator.js';
import {
   Configuration
} from "./Configuration.js";

import {
   ConfigPanel
} from "./config/ConfigPanel.js";

export class SuperMidi {
   constructor() {



      this.MidiOut = null;
      this.MidiInputs = [];
      this.MidiOuputs = [];
      this.knobSet = new KnobSet();
      this.padSet = null;
      this._MidiChangedTriggers = [];
      this._MidiMessageTriggers = [];
      this.Config = null;
      this.configPanel = null;
      this.initialized = false;


   }

   onMidiChanged(callback) {
      //TODO clear is hack
      //this._MidiChangedTriggers = [];
      if (this._MidiChangedTriggers.includes(callback)) {
         console.log("Ignoring attempt to subscribe to evnet!");
      } else
         this._MidiChangedTriggers.push(callback);
   }

   onMidiMessage(callback) {
      this._MidiMessageTriggers.push(callback);
   }

   onMidiChangedHandler(params) {
      if (this._MidiChangedTriggers) {
         this._MidiChangedTriggers.forEach(callback => callback(params));
      }
   }

   onMidiMessageHandler(params) {
      if (this._MidiMessageTriggers) {
         for (let i in this._MidiMessageTriggers)
            this._MidiMessageTriggers[i](params);
      }
   }

   getMIDIMessage(midiMessage) {
      let data = midiMessage.data; // Uint8Array(3)
      this.onMidiMessageHandler(midiMessage); //broadcasting message

      this.padSet.updateByMessage(data);

      let ix = PadSet.ixFromNotes(data);
      let pad = this.padSet.pads[ix];
      if (pad) {
         console.log("Pressed " + this.padSet.pads[ix].name);


      }
   }


   onMIDIFailure(error) {

      console.error('Could not access your MIDI devices.');
      console.error(error);

   }


   /**
    * 
    * @param {The id of the device for which the configurations must be loaded.} deviceId 
    */
   loadConfiguration(deviceId) {
      //console.group(`🖍️  [SuperMidi Configurator]`);
      console.debug(`Loading configuration for device '${deviceId}'.`);
      for (let input of this.MidiInputs.values()) {
         if (input.id == deviceId) {
            let configurator = new Configurator();
            return configurator.getConfigurationOnline(input.manufacturer, input.name)
               .then(c => this.Config = new Configuration(c))
               .catch(e => this.configFromStorage(input.manufacturer, input.name))
               .then(() => this.padSet = new PadSet(PAD_MODE.RADIO, this.Config.pads))
               .catch(e => this.configManually(input));
            break;
         }
      }
      console.groupEnd();
   }


   configFromStorage(manufacturer, name) {

      return new Promise((resolve, reject) => {
         this.Config = Configurator.getFromStorage(manufacturer, name);
         if (this.Config) {
            console.log(`Loading from local storage... %cfound!`, 'color: #008f68;');
            this.initialized = true;
            resolve();
         } else {
            throw "Loading from local storage: not found!"; //rejects
            
         }
      });
   }



   configManually(input) {
      if (this.configPanel)
         this.configPanel.closeForm();

      this.configPanel = new ConfigPanel(this, input);

   };


   /**
    * Call back for when MIDI controller is successfully connected.
    * @param {} midiAccess 
    */
   onMIDISuccess(midiAccess) {

      midiAccess.onstatechange = (e) => {
         //TODO Should code handle also other connection values? (closed)
         if (e.port.connection == 'pending')
            return;

         // Print information about the (dis)connected MIDI controller
         console.log(e.port.connection, e.port.name, e.port.manufacturer, e.port.state);
         this.MidiInputs = midiAccess.inputs;
         this.MidiOutputs = midiAccess.outputs;
         this.onMidiChangedHandler(e);
      };


      this.MidiInputs = midiAccess.inputs;
      this.MidiOutputs = midiAccess.outputs;


      for (var input of midiAccess.inputs.values()) {
         input.onmidimessage = (msg) => this.getMIDIMessage(msg);
      }



      if (this.MidiOutputs == null)
         console.error("No MIDI output found!");





      /*
         var resetMsg = getResetMessage();
      this.LaunchControlOut.send(resetMsg);
      var setTemplateMsg = getSetTemplateMessage();
      this.LaunchControlOut.send(setTemplateMsg);
      console.log("MIDI controller reset!");
*/
   }



   init() {
      if (!navigator.requestMIDIAccess) {
         let msg = "SuperMidiJS will not work here :( " +
            " The MIDI API is not supported in this browser. " +
            " To use this library, please switch to a support browser, such as Chrome. " +
            " For a list of supported browsers, check https://caniuse.com/#feat=midi";

         alert(msg);
         console.error(msg);
         return;
      }
      navigator.requestMIDIAccess({
            sysex: true
         })
         .then((midiAccess) => this.onMIDISuccess(midiAccess), this.onMIDIFailure);
   }

}