/**
 * Represents a pad or button in a MIDI controller. 
 */
export class Pad {
   constructor(name, code, mode) {
      this.name = name;
      this.code = code;
      this.status = false;
   }
}