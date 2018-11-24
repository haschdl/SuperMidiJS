import {
   Configuration
} from "./Configuration.js";

export const _configFolder = "/config/";

export class Configurator {

   constructor() {

   }

   static configFolder() {
      return _configFolder;
   }
   static getFileName(manufacturer, portName) {
      return manufacturer + " " + portName + ".json";
   }

   static getFilePath(manufacturer, portName) {
      let fileName = this.getFileName(manufacturer, portName);
      return Configurator.configFolder() + fileName;
   }

   static saveToStorage(configJson) {
      let manufacturer = configJson['manufacturer'];
      let name = configJson['name'];

      if (!manufacturer || !name)
         throw "Object must contain attributes 'manufacturer' and 'name'.";

      let fileName = this.getFileName(manufacturer, name);
      localStorage.setItem(fileName, JSON.stringify(configJson));
   }

   static getFromStorage(manufacturer, portName) {
      let fileName = this.getFileName(manufacturer, portName);
      let item = localStorage.getItem(fileName);
      if (item == null) {
         return null;
      }
      let configJson = JSON.parse(item);
      return new Configuration(configJson);
   }

   getConfigurationOnlineResponse(resp, manufacturer, portName) {

      if (resp.ok == false || resp.status == 404) {
         let msg = `Unfortunately a configuration for ${manufacturer} ${portName} was not found`;
         console.warn(msg);
         return Promise.reject(msg);
      }

      console.debug(`Configuration for ${portName} found online!`);
      return resp.json();

   }


   getConfigurationOnline(manufacturer, portName) {
      return new Promise((resolve, reject) => {
         let url = Configurator.getFilePath(manufacturer, portName);

         fetch(url)
            .then((resp) => this.configLoaded(resp, manufacturer, portName))
            .then(js => resolve(js))
            .catch((e) => reject(e))
      });

   }

}