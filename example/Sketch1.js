/*
 * p5.js specific content
 */

var controller;
var s = 35;
let select = null, padModeSelec = null;

function setup() {
   createSpan("MIDI Inputs: ").parent("content");
   select = createSelect();
   select.option("Please connect a MIDI device");
   select.changed = midiDeviceSelected;
   select.parent("content");

   let bt = createButton("Change").parent("content");
   

   var myCanvas = createCanvas(16 * s, 250);
   myCanvas.parent('sketch');


   //controller = new LaunchController();
   controller = window.controller;
   controller.init();
   controller.onMidiChanged(this.midiChanged);
   bt.elt.onclick= () => controller.configManually();

   createP().parent("content");
   createSpan("Operation of pads: ").parent("content");
   padModeSelec = createSelect().parent("content");
   padModeSelec.option('Toggle', 1);
   padModeSelec.option('Radio', 2);
   

   frameRateEl = createP("Frame rate: ");

}

function midiChanged() {
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
   var padOption = padModeSelec.selected();
   controller.padSet.padMode = padOption;


   background(80);
   translate(s/2, 0);
   ellipseMode(CORNER);

   let c = controller.padSet.padCount;
   for (let i = 0; i < c; i++) {
      let y = 50 + s* 2 * int(i / 8);
      let x = s * 2 * (i%8);
      //console.log(y);
      let key = controller.padSet.padKeys[i]; //fetched the key at second index

      if (controller.padSet.pads[key] && controller.padSet.pads[key].status == true) {
         strokeWeight(2);
         stroke(0);
         fill(255, 0, 0);
         rect(x, y, s, s);
      } else {
         fill(255);
         rect(x, y, s, s);
     
      }
      fill(255);
      text(controller.padSet.pads[key].name, x,y-5);
   }


   //    //drawing 8 knobs, upper row

   //   //drawing positions for arcs
   //   var start = HALF_PI * 1.3;
   //   var end = TWO_PI + HALF_PI * .7;

   //    for (var i = 0; i < 16; i++) {
   //       var x = s * 2 * (i % 8);
   //       var y = 2*s * (.5 + int(i/8));
   //       fill(0);
   //       ellipse(x, y , s, s);

   //       fill(120);
   //       var normal =controller.knobSet[i].knobValue / 127;
   //       arc(x, y, s, s, start, start + normal*(end-start),PIE);
   //       fill(255);
   //       text(controller.knobSet[i].knobValue,x,y);
   //    }  
   //    // drawing 8as * (1 +s   
   //    translate(0,4*s);
   //    for (var i = 0; i < 8; i++) {
   //       if (controller.padSet[i].status == true) {
   //          strokeWeight(2);
   //          stroke(0);
   //          fill(255, 0, 0);
   //          rect(s * 2 * i, 50, s, s);

   //       } else {
   //          noFill();
   //          rect(s * 2 * i, 50, s, s);
   //       }
   //    }

}