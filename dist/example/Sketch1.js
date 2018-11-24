/*
 * p5.js specific content
 */

var controller;
var s = 35;
let select = null,
   padModeSelec = null;

function setup() {
   controller = window.controller;
   createSpan("MIDI Inputs: ").parent("content");
   select = createSelect();
   select.option("Please connect a MIDI device");
   select.changed = midiDeviceSelected;
   select.parent("content");

   let bt = createButton("Change").parent("content");


   var myCanvas = createCanvas(32 * s, 500);
   myCanvas.parent('sketch');


   //controller = new LaunchController();
   controller = window.controller;
   controller.init();
   controller.onMidiChanged((e) => this.midiChanged(e));
   bt.elt.onclick = () => controller.configManually();

   createP().parent("content");
   createSpan("Operation of pads: ").parent("content");
   padModeSelec = createSelect().parent("content");
   padModeSelec.option('Toggle', 1);
   padModeSelec.option('Radio', 2);


   frameRateEl = createP("Frame rate: ");

}

function midiChanged(e) {
   if (e.port.connection != 'open')
      return;

   select.elt.options.length = 0;
   for (let inp of controller.MidiInputs.values())
      select.option(inp.manufacturer + " " + inp.name, inp.id);

   if (select.elt.length == 0)
      select.option("Please connect a MIDI device");

   if (select.elt.length == 1)
      midiDeviceSelected(select.elt.options[0].value);

}

function midiDeviceSelected(e) {
   //console.log(e);
   controller.loadConfiguration(e); //.then(() => ;

   //()=>console.dir(controller.Config));

}

function draw() {
   frameRateEl.html("Frame rate: " + Math.round(frameRate()));
   ellipse(0, 0, s, s);


   //adjusting PadSet mode
   let c = 0;
   if (controller.initialized) {
      var padOption = padModeSelec.selected();
      controller.padSet.padMode =  Number.parseInt(padOption);
      c = controller.padSet.padCount;
   }


   background(80);
   translate(s / 2, 0);
   ellipseMode(CORNER);


   for (let i = 0; i < c; i++) {
      let y = 50 + s * 2 * int(i / 8);
      let x = s * 2 * (i % 8);
      //console.log(y);
      let pad = controller.padSet.pads[i]; //fetched the key at second index

      if (pad.state == true) {
         strokeWeight(2);
         stroke(0);
         fill(255, 0, 0);
         rect(x, y, s, s);
      } else {
         fill(255);
         rect(x, y, s, s);

      }
      fill(255);
      text(pad.name, x, y - 5);
   }
}