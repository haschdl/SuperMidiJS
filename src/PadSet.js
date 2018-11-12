export var PAD_MODE = Object.freeze({
   /**
    * Pad works like a on/off switch. The state of the pad is persisted, and pad is lit
    * until a second push. Several pads can be turned on at the same time.
    * This is the default mode. Note: the state of each pad is available from
    * {@link LaunchController#getPad(PADS)}.
    */
   TOGGLE: 1,
   /**
    * Pads work as a group of "radio buttons", meaning that only one pad can be activated at a time.
    * Pushing one pad will deactivate the other pads.
    */
   RADIO: 2
});

export class Pad {
   constructor(name, code, mode) {
      this.name = name;
      this.code = code;
      this.status = false;

   }
}

export class PadSet {

   constructor(padMode, padNotes) {
      this.padCount = Object.keys(padNotes).length;
      this.padMode = padMode;
      this.pads = {};
      this.padKeys = [];


      let indexes = Object.keys(padNotes);
      for (let i = 0; i < this.padCount; i++) {
         let objectKey = indexes[i];
         let ix = PadSet.ixFromNotes(Uint8Array.from(padNotes[objectKey]));
         this.pads[i] = new Pad(objectKey.toUpperCase(), i);

         if (!this.padKeys[ix])
            this.padKeys[ix] = [];

         this.padKeys[ix].push(i);
      }

      this.padKeys = Object.keys(this.pads);
   }

   updateByMessage(data) {
      let keys = this.padKeys[PadSet.ixFromNotes(data)];



      keys.forEach(key => {
         let val = this.pads[keys[key]].status;

         this.pads[keys[key]].status = !val;

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