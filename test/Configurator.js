var assert = require('assert');
let path = require('path');
global.window = {}
import 'mock-local-storage'
window.localStorage = global.localStorage;

let Configurator = require(path.join(__dirname, '../src/', 'Configurator')).Configurator;


// Create a group of tests about Configuration
describe('Configuration', function () {



   // Within our Configuration group, create a group of tests for storage
   describe('Basic setup', function () {
      //test setup
      let configurator;

      beforeEach(() => {
         // Create a new Rectangle object before every test.

      });



      it('should have a non-empty, valid config folder', () => {
         let folder = Configurator.configFolder();
         assert.equal(folder, "/config/");
      });
      it('should return valid file name', () => {
         let name = Configurator.getFileName("A", "B");

         assert.equal(name, "A B.json");
      });
      it('should return valid file path', () => {
         let name = Configurator.getFilePath("A", "B");

         assert.equal(name, "/config/A B.json");
      });
      it('should not return configuration for a random file name (local storage)', () => {
         let config = Configurator.getFromStorage('123456', 'ABCDEF');
         assert.equal(config, null);
      });
      it('should err when saving an inconsistent configuration to storage', () => {
         let configMock = {
            "A": "123456",
            "B": 'ABCDEF'
         };
         assert.throws(() => Configurator.saveToStorage(configMock));
      });
      it('should save a consistent config. object to storage', () => {
         let configMock = {
            "manufacturer": "123456",
            "name": 'ABCDEF'
         };
         Configurator.saveToStorage(configMock);


         let fromStorage = Configurator.getFromStorage(configMock['manufacturer'], configMock['name']);
         assert(fromStorage);
         assert(fromStorage['manufacturer']);
         assert(fromStorage['manufacturer'] === "123456");
      });
      it('should instantiate without error', () => {
         configurator = new Configurator();
         assert(configurator);
      });
   });
});