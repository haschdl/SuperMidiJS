/**
 * Represents a pad or button in a MIDI controller. 
 */
export class Pad {
   /**
    * Instantiates a new pad object, representing a physical pad and its state.
    * @param {string} name A simple name for a pad, such as PAD_1 
    * @param {string} code  
    */
   constructor(name, code) {
      this.name = name;
      this.code = code;
      this.state = false;
   }
}