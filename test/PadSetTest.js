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
   let padSetRadio;
   let padSetToggle;



   // Within our Configuration group, create a group of tests for storage
   describe('Basic setup', function () {
      this.beforeAll(function() {
         padSetRadio = new PadSet(PAD_MODE.RADIO,  { "pad_1" : [112,100,10], "pad_2" : [1,2,1]});
         padSetToggle = new PadSet(PAD_MODE.TOGGLE,  { "pad_1" : [3,4,5], "pad_2" : [1,2,1]});
     });

      it('Constructor', () => {
         assert.throws(() => new PadSet());
         assert(padSetToggle);
         assert.strictEqual(padSetToggle.padCount, 2);
      });

      it('Pad count', () => {
                
         assert.strictEqual(padSetRadio.padCount, 2);
      });

      it('Get pad', () => {
         let padSet = new PadSet(PAD_MODE.RADIO, { "pad_1" : "[1,1,1]"});         
         let pad =  padSet.getPad(0);
         assert(pad);
         assert.strictEqual(pad.name, "PAD_1");
         assert.strictEqual(pad.state, false);
         
      });


      it('should calculate an index from MIDI notes', () => {
         assert.strictEqual(0, PadSet.ixFromNotes([0,0,0]));
         assert.strictEqual(Math.pow(2,16), PadSet.ixFromNotes([0,0,1]));
         assert.strictEqual(Math.pow(2,16) + Math.pow(2,8), PadSet.ixFromNotes([0,1,1]));
         assert.strictEqual(1, PadSet.ixFromNotes([1,0,0]));
         
      });

      it('should calculate an index from MIDI notes', () => {
         assert.strictEqual(0, PadSet.ixFromNotes([0,0,0]));
         assert.strictEqual(Math.pow(2,16), PadSet.ixFromNotes([0,0,1]));
         assert.strictEqual(Math.pow(2,16) + Math.pow(2,8), PadSet.ixFromNotes([0,1,1]));
         assert.strictEqual(1, PadSet.ixFromNotes([1,0,0]));
         
      });

      it('should update one pad when mode is RADIO (1)', () => {
         
         padSetRadio.updatePadsRadio([0]);
         assert.strictEqual(padSetRadio.pads[0].state, true);
         assert.strictEqual(padSetRadio.pads[1].state, false);

         //let ix = PadSet.ixFromNotes([1,1,1]);
      });

      it('should update one pad when mode is RADIO (2)', () => {
         padSetRadio.updatePadsRadio([1]);
         assert.strictEqual(padSetRadio.pads[0].state, false);
         assert.strictEqual(padSetRadio.pads[1].state, true);
      });

      it('should update one or more pads when mode is TOGGLE', () => {
         padSetToggle.updatePadsToggle([0]);
         padSetToggle.updatePadsToggle([1]);
         assert.strictEqual(padSetToggle.pads[0].state, true);
         assert.strictEqual(padSetToggle.pads[1].state, true);
      });


      it('should update by message (TOGGLE)', () => {
         padSetToggle.updateByMessage([1,2,1]);
         assert.strictEqual(padSetToggle.pads[0].state, true);
         assert.strictEqual(padSetToggle.pads[1].state, false);
      });
      

      it('should update by message (RADIO)', () => {
         padSetRadio.updateByMessage([112,100,10]);
         assert.strictEqual(padSetRadio.pads[0].state, true);
         assert.strictEqual(padSetRadio.pads[1].state, false);
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