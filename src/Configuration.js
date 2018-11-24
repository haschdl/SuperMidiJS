/**
 * Holds the mapping between pads and notes for a given MIDI controller.
 */
export class Configuration {
   /**
    * Instantiates a new Configuration from JSON containing the required values.
    * @param {Object} param0 
    */
   constructor({
      manufacturer,
      name,
      pads = {},
      sliders = {}
   }) {
      if (!manufacturer)
         throw "Required attribute: manufacturer";

      if (!name)
         throw "Required attribute: name";

      this.manufacturer = manufacturer;
      this.name = name;
      this.pads = pads;
      this.sliders = sliders;

   }
}