import {
   Pad
} from './Pad.js';
import {
   PAD_MODE
} from './PAD_MODE.js';

/**
 * A group of several Pad objects, which can be updated using a 
 * @see PAD_MODE
 */
export class PadSet {

   /**
    * Instantiates a new @see PadSet
    * @param {PAD_MODE} padMode How pads should be updated (e.g. toggle or radio).
    * @param {Object} padNotes A simple object containing names and 3 notes to list to. 
    */
   constructor(padMode, padNotes) {
      if(!padNotes || typeof padNotes != 'object' )
         throw "padNotes must be an object";

      this.padCount = Object.keys(padNotes).length;
      this.padMode = padMode;
      this.pads = [];
      this.padKeys = [];


      let indexes = Object.keys(padNotes);
      for (let i = 0; i < this.padCount; i++) {
         let objectKey = indexes[i]; // pad_1,pad_2...
         let noteArray = Uint8Array.from(padNotes[objectKey]);
         let ix = PadSet.ixFromNotes(noteArray);
         this.pads[i] = new Pad(objectKey.toUpperCase(), i);

         if (!this.padKeys[ix])
            this.padKeys[ix] = [];

         this.padKeys[ix].push(i);
      }

      //this.padKeys = Object.keys(this.pads);
   }

   updateByMessage(data) {
      let ix = PadSet.ixFromNotes(data);
      let keys = this.padKeys[ix];

      if (!keys) {
         console.log("Received a note which is not mapped to any SuperMidiJS key! " + data);
         return;

      }

      //updating model, according to PAD_MODE
      switch (this.padMode) {
         case PAD_MODE.TOGGLE:
            this.updatePadsToggle(keys);
            break;
         case PAD_MODE.RADIO:
            this.updatePadsRadio(keys);
            break;
         default:
            break;
      }
   }

   updatePadsRadio(keys) {
      //disable all others
      this.pads.forEach(p => p.state = false);

      keys.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   updatePadsToggle(keys) {
      keys.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   static ixFromNotes(data) { //MidiMessage is Uint8Array[3]
      //return one integer, same as data[2]*2^16 + data[1]*2^8+data[0]*2^0
      return (data[2] << 16) + (data[1] << 8) + data[0];
   }

   getPad(padIndex) {
      return this.pads[padIndex];
   }

   get firstSelected() {
      for (let i = 0; i < this.padCount; i++) {
         if (this[i].state == true)
            return this.pads[i].code;
      }
   }
}