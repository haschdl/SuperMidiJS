var assert = require('assert');
let path = require('path');
global.window = {}
import 'mock-local-storage'
import { Pad } from '../src/Pad';
import { PAD_MODE } from '../src/PAD_MODE';
window.localStorage = global.localStorage;

let PadSet = require(path.join(__dirname, '../src/', 'PadSet')).PadSet;


// Create a group of tests about Configuration
describe('PadSet', function () {
   // Within our Configuration group, create a group of tests for storage
   describe('Basic setup', function () {
      
      it('Constructor', () => {
         assert.throws(() => new PadSet());
         let padSet = new PadSet(PAD_MODE.RADIO, { "pad_1" : "[1,1,1]"});
         assert(padSet);
         assert.strictEqual(padSet.padCount, 1);
      });

      it('Pad count', () => {
         let padSet = new PadSet(PAD_MODE.RADIO, { "pad_1" : "[1,1,1]"});         
         assert.strictEqual(padSet.padCount, 1);
      });

      it('Get pad', () => {
         let padSet = new PadSet(PAD_MODE.RADIO, { "pad_1" : "[1,1,1]"});         
         let pad =  padSet.getPad(0);
         assert(pad);
         assert.strictEqual(pad.name, "PAD_1");
         assert.strictEqual(pad.state, false);
         
      });


   });
 describe('Pad modes', function () {      
      it('should have only 2 pad modes', () => {
         assert.strictEqual(Object.keys(PAD_MODE).length, 2);
         assert.strictEqual(PAD_MODE.TOGGLE,1);
         assert.strictEqual(PAD_MODE.RADIO,2);
      });

   });

});