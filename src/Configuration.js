export class Configuration {
   constructor({manufacturer,portName, pads=[], sliders=[]}) {
      this.manufacturer = manufacturer;
      this.portName = portName;
      this.pads = pads;
      this.sliders= sliders;

   }
}