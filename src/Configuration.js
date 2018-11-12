export class Configuration {
   constructor({manufacturer,name, pads={}, sliders={}}) {
      this.manufacturer = manufacturer;
      this.name = name;
      this.pads = pads;
      this.sliders= sliders;

   }
}