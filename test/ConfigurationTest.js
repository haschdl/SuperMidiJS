var assert = require('assert');
let path = require('path');
let Configuration = require(path.join(__dirname, '../src/', 'Configuration')).Configuration;

// Create a group of tests about Configuration
describe('Configuration', function () {
   // Within our Configuration group, create a group of tests for storage
   describe('Constructor', function () {

      it('should fail from an empty or invalid object', () => {
         assert.throws(() => new Configuration());
         assert.throws(() => new Configuration({}));
         assert.throws(() => new Configuration({
            'ABC': '123'
         }));

      });

      it('should fail if manufacturer is not provided', () => {
         let params = {
            "name": "test"
         };
         assert(() => new Configuration(params));
      });
      it('should fail if name is not provided', () => {
         let params = {
            "manufacturer": "test"
         };
         assert(() => new Configuration(params));
      });
      it('should return a valid Configuration with the correct input', () => {
         let params = {
            "manufacturer": "test",
            "name": "test"
         };
         let c = new Configuration(params);
         assert(c);
      });

      it('should return a valid Configuration with the correct input (pads and sliders', () => {
         let params = {
            "manufacturer": "test",
            "name": "test",
            "pads" : [1,2,3],
            "sliders" : [1,2,3]

         };
         let c = new Configuration(params);
         assert(c);
      });
   });
});