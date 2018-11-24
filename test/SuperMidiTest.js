var assert = require('assert');
let path = require('path');


let SuperMidi = require(path.join(__dirname, '../src/', 'SuperMidi')).SuperMidi;


// Create a group of tests about Configuration
describe('SuperMidi', () => {
   //test setup
   let configurator;
   // Within our Configuration group, create a group of tests for storage
   describe('Basic setup', () => {
      it('should instantiate', () => {
         let c = new SuperMidi();
         assert(c);
      });
   });
});