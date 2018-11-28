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

      //console.log("New pad from notes " + JSON.stringify(padNotes));
      this.padCount = Object.keys(padNotes).length;
      this.padMode = padMode;
      this.pads = [];
      this.padKeysDict = {};


      let indexes = Object.keys(padNotes);
      
      for (let i = 0; i < this.padCount; i++) {
         let objectKey = indexes[i]; // pad_1,pad_2...         
         let noteArray = padNotes[objectKey];
         let ix = PadSet.ixFromNotes(noteArray);
         this.pads.push( new Pad(objectKey.toUpperCase(), i));

         if (!this.padKeysDict[ix])
            this.padKeysDict[ix] = [];

         this.padKeysDict[ix].push(i);
      }
   }

   updateByMessage(data) {
      let ix = PadSet.ixFromNotes(data);
      let keys = this.padKeysDict[ix];

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

   updatePadsRadio(indexes) {
      //disable all others
      this.pads.forEach(p => p.state = false);

      indexes.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   updatePadsToggle(indexes) {
      indexes.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   static ixFromNotes(data) { //MidiMessage is Uint8Array[3]
      //return one integer, same as data[2]*(2^16) + data[1]*(2^8)+data[0]*(2^0)
      return (data[2] << 16) + (data[1] << 8) + data[0];
   }

   getPad(padIndex) {
      return this.pads[padIndex];
   }

}