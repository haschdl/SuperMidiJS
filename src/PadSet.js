import {
   Pad
} from './Pad.js';
import {
   PAD_MODE
} from './PAD_MODE.js';

export class PadSet {

   constructor(padMode, padNotes) {
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
      this.pads.forEach(p => p.status = false);

      keys.forEach(i => {
         let val = this.pads[i].status;
         this.pads[i].status = !val;
      });
   }

   updatePadsToggle(keys) {
      keys.forEach(i => {
         let val = this.pads[i].status;
         this.pads[i].status = !val;
      });
   }

   static ixFromNotes(data) { //MidiMessage is Uint8Array[3]
      //return one integer, same as data[2]*2^16 + data[1]*2^8+data[0]*2^0
      return (data[2] << 16) + (data[1] << 8) + data[0];
   }

   get length() {
      return this.padCount;
   }
   getPad(padIndex) {
      return this.pads[padIndex];
   }

   get firstSelected() {
      for (let i = 0; i < this.padCount; i++) {
         if (this[i].status == true)
            return this.pads[i].code;
      }
   }
}