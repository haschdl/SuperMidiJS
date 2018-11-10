import {
   PadSet,
   PAD_MODE
} from './PadSet.js';
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
      this.padSet = new PadSet(8, PAD_MODE.RADIO);
      this._MidiChangedTriggers = [];
      this._MidiMessageTriggers = [];
      this.Config = null;
      this.configPanel = null;
   }

   onMidiChanged(callback) {
      //TODO clear is hack
      this._MidiChangedTriggers = [];
      this._MidiChangedTriggers.push(callback);
   }

   onMidiMessage(callback) {

      this._MidiMessageTriggers.push(callback);
   }

   onMidiChangedHandler(params) {
      if (this._MidiChangedTriggers) {
         for (let i in this._MidiChangedTriggers)
            this._MidiChangedTriggers[i](params);
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

      //console.log(data);
      let ix = PadSet.ixFromNotes(data);
      let pad = this.padSet.pads[ix];
      if (pad) {
         console.log("Pressed " + this.padSet.pads[ix].name);
         let val = this.padSet.pads[ix].status;
         this.padSet.pads[ix].status = !val;
      }
   }


   onMIDIFailure() {
      console.log('Could not access your MIDI devices.');
   }


   /**
    * 
    * @param {The id of the device for which the configurations must be loaded.} deviceId 
    */
   loadConfiguration(deviceId) {
      console.group(`🖍️  [SuperMidi Configurator]`);
      console.debug(`Loading configuration for device '${deviceId}'.`);
      for (let input of this.MidiInputs.values()) {
         if (input.id == deviceId) {
            let configurator = new Configurator();
            return configurator.getConfigurationOnline(input.manufacturer, input.name)
               .then(c => this.Config = new Configuration(c))
               .then(() => this.padSet = new PadSet(PAD_MODE.RADIO, this.Config.pads))
               .catch(e => this.configFromStorage(input.manufacturer, input.name))
               .catch(e => this.configManually());
            break;
         }
      }
      console.endgroup();
   }

   configFromStorage(manufacturer, name) {
      console.log("Loading from local storage...");
      return new Promise((resolve, reject) => {
         let config = Configurator.getFromStorage(manufacturer, name);
         if (config) {
            console.warn(`Loading from local storage... %cfound!`, 'color: #008f68;');
            resolve();
         } else {
            console.warn(`Loading from local storage... %cnot found!`, 'color: RED; font-weight:bold');
            reject();
         }
      });
   }

   configManually() {
      if (this.configPanel)
         this.configPanel.closeForm();
      else
         this.configPanel = new ConfigPanel(this);

      this.configPanel.buildForm();
   }

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
      navigator.requestMIDIAccess({
            sysex: true
         })
         .then((midiAccess) => this.onMIDISuccess(midiAccess), this.onMIDIFailure);
   }

}