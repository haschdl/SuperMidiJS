/**
 * Represents a pad or button in a MIDI controller. 
 */
class Pad {
   /**
    * Instantiates a new pad object, representing a physical pad and its state.
    * @param {string} name A simple name for a pad, such as PAD_1 
    * @param {string} code  
    */
   constructor(name, code) {
      this.name = name;
      this.code = code;
      this.state = false;
   }
}

var PAD_MODE = Object.freeze({
   /**
    * Pad works like a on/off switch. The state of the pad is persisted, and pad is lit
    * until a second push. Several pads can be turned on at the same time.
    * This is the default mode. Note: the state of each pad is available from
    * {@link LaunchController#getPad(PADS)}.
    */
   TOGGLE: 1,
   /**
    * Pads work as a group of "radio buttons", meaning that only one pad can be activated at a time.
    * Pushing one pad will deactivate the other pads.
    */
   RADIO: 2
});

class PadSet {

   constructor(padMode, padNotes) {
      if(!padNotes || typeof padNotes != 'object' )
         throw "padNotes must be an object";

      this.padCount = Object.keys(padNotes).length;
      this.padMode = padMode;
      this.pads = [];
      this.padKeys = [];


      let indexes = Object.keys(padNotes);
      for (let i = 0; i < this.padCount; i++) {
         let objectKey = indexes[i]; // pad_1,pad_2...
         let noteArray = Uint8Array.from(padNotes[objectKey]);
         let ix = PadSet.ixFromNotes(noteArray);
         this.pads[i] = new Pad(objectKey.toUpperCase(), i);

         if (!this.padKeys[ix])
            this.padKeys[ix] = [];

         this.padKeys[ix].push(i);
      }

      //this.padKeys = Object.keys(this.pads);
   }

   updateByMessage(data) {
      let ix = PadSet.ixFromNotes(data);
      let keys = this.padKeys[ix];

      if (!keys) {
         console.log("Received a note which is not mapped to any SuperMidiJS key! " + data);
         return;

      }

      //updating model, according to PAD_MODE
      switch (this.padMode) {
         case PAD_MODE.TOGGLE:
            this.updatePadsToggle(keys);
            break;
         case PAD_MODE.RADIO:
            this.updatePadsRadio(keys);
            break;
         default:
            break;
      }
   }

   updatePadsRadio(keys) {
      //disable all others
      this.pads.forEach(p => p.state = false);

      keys.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   updatePadsToggle(keys) {
      keys.forEach(i => {
         let val = this.pads[i].state;
         this.pads[i].state = !val;
      });
   }

   static ixFromNotes(data) { //MidiMessage is Uint8Array[3]
      //return one integer, same as data[2]*2^16 + data[1]*2^8+data[0]*2^0
      return (data[2] << 16) + (data[1] << 8) + data[0];
   }

   getPad(padIndex) {
      return this.pads[padIndex];
   }

   get firstSelected() {
      for (let i = 0; i < this.padCount; i++) {
         if (this[i].state == true)
            return this.pads[i].code;
      }
   }
}

class Knob {
   constructor(knobCode, minValue, maxValue) {
      this.min_value = minValue;
      this.max_value = maxValue;
      this.value = 0;
   }

   range(minValue, maxValue) {

      return this;
   }


   get knobValueNormal() {
      let input = 0;
      if (this.hasDefault)
         input = this.defaultValue;
      else
         input = this.value;

      return (input - this.min_value) / (this.max_value - this.min_value);

   }

   set knobValue(knobValue) {
      this.value = knobValue;
   }

   get knobValue() {
      return this.value;
   }

}

class KnobSet {

   constructor(numberOfKnobs) {
      for (let i = 0; i < numberOfKnobs; i++) {
         this[i] = new Knob(i, 0, 127);
      }      
   }
}

class Configuration {
   constructor({manufacturer,name, pads={}, sliders={}}) {
      this.manufacturer = manufacturer;
      this.name = name;
      this.pads = pads;
      this.sliders= sliders;

   }
}

const _configFolder = "/config/";

class Configurator {

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
            .catch((e) => reject(e));
      });

   }

}

const ConfigPanelStyles = ".formOuter{border-radius:5px;background-color:#cacacaf8;padding:10px;display:table;position:fixed;top:5vh;width:50vw;margin-left:25vw}.formMiddle{display:table-cell;vertical-align:middle}.formInner{margin-left:auto;margin-right:auto}form{overflow:auto;height:80vh;font-family:Helvetica}input[type=text],select{width:50%;padding:12px 20px;margin:8px 0;border:1px solid #ccc;border-radius:4px;box-sizing:border-box}.inputSmall{width:20%!important;text-align:center;padding:5px;font-family:monospace;min-width:130px}label{width:15%;margin:20px 0;padding:10px 5px;text-align:right;display:inline-block}.labelSmall{width:8%}input[type=submit]{width:100%;background-color:#4CAF50;color:#fff;padding:14px 20px;margin:8px 0;border:none;border-radius:4px;cursor:pointer}input[type=submit]:hover{background-co";

function removeElement(elementId) {
   let elet = document.getElementById(elementId);
   if (elet)
      elet.parentNode.removeChild(elet);
}
/**
 * Creates a new element, with optional attributes
 * @param {*} tag 
 * @param {*} id 
 * @param {*} name 
 * @param {*} innerHtml 
 * @param {*} type 
 */
function createEl(tag, id, name, innerHtml, type) {
   let el = document.createElement(tag);
   if (innerHtml)
      el.innerHTML = innerHtml;
   if (type)
      el.type = type;
   if (name)
      el.name = name;
   el.id = id;
   return el;
}
function createAndAppend(tag, id, name, innerHtml, type, appendTo) {
   let el = createEl(tag, id, name, innerHtml, type);
   appendTo.appendChild(el);
}

function setValue(name, value) {
   let els = document.getElementsByName(name);
   if (els && els[0])
      els[0].value = JSON.stringify(value).replace(/\"/g, "");
}
/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @param {filter} Function to filter which elements to include in the JSON.
 *                 You could use for example (e) => e.dataset.export="true"
 * @return {Object}                               form data as an object literal
 */
function formToJSON(elements, filter) {
   return [].reduce.call(elements, (data, element) => {
      if (!filter(element))
         return data;

      if (element.dataset.exportArray) {
         let listName = element.dataset.exportArray;
         if (!data[listName])
            data[listName] = {};

         let val = element.value || "[]";
         data[listName][element.name] = JSON.parse(val);
      } else
         data[element.name] = element.value;

      return data;

   }, {});
}

function highlightDuplicates(text) {
   //checking for duplicates
   let inputs = document.querySelectorAll('input[type=text]');
   let possibleDups = Array.from(inputs).filter(el => el.value == text);

   if (possibleDups && possibleDups.length > 1) {
      possibleDups.forEach(el => el.classList.add('inputDuplicate'));
      return true;
   }
   return false;
}

function createSelectOption(text, value, appendTo) {
   let opt = document.createElement("option");
   opt.value = value;
   opt.text = text;
   appendTo.appendChild(opt);
}

//http://jsfiddle.net/ka0yn8Lv/34/


function loadConfigPanelStyles() {
   var node = document.createElement('style');
   node.innerHTML = ConfigPanelStyles;
   document.body.appendChild(node);

}



class ConfigPanel {

   constructor(controller, input) {
      this.controller = controller;
      this.lastMessageTimeStamp = 0;
      this.padCount = 8;
      this.input = input;

      loadConfigPanelStyles();

      /***
       * Subscribing to MIDI messages from the SuperMidi
       */
      this.controller.onMidiMessage((midiMessage) => {
         if (Date.now() - this.lastMessageTimeStamp < 250)
            return;
         else this.lastMessageTimeStamp = Date.now();


         let text = `[${midiMessage.data.toString()}]`;

         let curr = document.activeElement;
         let elId = "" + curr.id;

         //removing current duplicates
         let val = document.activeElement.value;

         Array.from(document.querySelectorAll(".inputDuplicate"))
            .filter(el => el.value == val)
            .forEach(el => el.classList.remove('inputDuplicate'));


         if (curr.type == "text") {
            document.activeElement.value = text;
            // document.activeElement.blur();
         }

         highlightDuplicates(text);
         let nextField = document.activeElement.nextSibling;
         while (nextField) {
            if (nextField.type && nextField.type == "text") {
               nextField.focus();
               break;
            }
            nextField = nextField.nextSibling;
         }

      });

      this.controller.onMidiChanged(this.onMidiChanged);

      if (this.controller.Config)
         this.padCount = Object.keys(this.controller.Config.pads).length;
      this.buildForm(input);
   }

   onMidiChanged(data) {


      let metadata = {
         m: "disconnected",
         n: "disconnected"
      };
      if (data.port.state != "disconnected") {
         metadata = {
            m: data.port.manufacturer,
            n: data.port.name
         };
      }
      document.getElementById('jsonManufacturer').value = metadata["m"];
      document.getElementById('jsonName').value = metadata["n"];

   }


   jsonToForm(json) {
      Object.keys(json).forEach(key => {
         if (json[key].constructor == Object) {
            Object.keys(json[key]).forEach(key1 => setValue(key1, json[key][key1]));
         } else
            setValue(key, json[key]);

      });

      Object.keys(json).forEach(key => {
         if (json[key].constructor == Object) {
            Object.keys(json[key]).forEach(key1 => highlightDuplicates(JSON.stringify(json[key][key1])));
         } else
            highlightDuplicates(json[key]);
      });


   };

   loadExisting(configuration) {
      if (configuration)
         this.jsonToForm(configuration);
   }

   closeForm() {
      removeElement("formDivOuterSuperMidi");
   }

   /**
    * A handler function to prevent default submission and run our custom script.
    * @param  {Event} event  the submit event triggered by the user
    * @return {void}
    */
   handleFormSubmit(event) {
      const form = document.getElementById("formSuperMidiConfig");

      //event.preventDefault();
      const data = formToJSON(form.elements, (e) => e.dataset.export == "true");

      console.dir(data);


      Configurator.saveToStorage(data);
      this.controller.loadConfiguration(data.name);

      removeElement("formDivOuterSuperMidi");

   }

   changeselect(e) {
      let inpEl = document.getElementById('fInputPadCount');
      let selEl = e.srcElement;
      let val = selEl.options[selEl.selectedIndex].value;

      if (this.padCount != val) {
         this.padCount = val;
         this.closeForm();
         this.buildForm();
      }



      if (val == 'Other') {
         inpEl.style.visibility = 'visible';
      } else {
         inpEl.style.visibility = 'hidden';
      }
   }


   buildForm(input) {
      let dummy = () => false;


      let d = document;
      console.log("Fallback to manual configuration from form.");

      let fForm = createEl('form', 'formSuperMidiConfig');
      let fDivOuter = createEl('div', "formDivOuterSuperMidi", );
      fDivOuter.className = "formOuter";

      let fDivMiddle = createEl('div', "formDivMiddleSuperMidi", );
      fDivMiddle.className = "formMiddle";

      let fDiv = createEl('div', "formDivInnerSuperMidi", );
      fDiv.className = "formInner";

      createAndAppend('h1', 'deviceInfo', '', 'Device information', "", fForm);
      createAndAppend('p', 'deviceInfoInstruction', '', 'Reconnecting a MIDI device will populate manufacturer and port name.', "", fForm);


      let fInput2 = createEl('input', 'jsonName', 'name', '', 'text');
      fInput2.dataset.export = "true";

      if (input)
         fInput2.value = input.name;

      let fLabel2 = createEl('Label', 'lblName', 'lblName', 'Device name');
      fLabel2.setAttribute("for", "name");


      fForm.appendChild(fLabel2);
      fForm.appendChild(fInput2);
      createAndAppend("BR", '', '', '', '', fForm);

      let fInput = createEl('input', "jsonManufacturer", 'manufacturer', '', 'text');
      fInput.dataset.export = "true";
      if (input)
         fInput.value = input.manufacturer;

      let fLabel = createEl('Label', 'lblManufacturer', '', 'Manufacturer');
      fLabel.setAttribute("for", "manufacturer");

      fForm.appendChild(fLabel);
      fForm.appendChild(fInput);
      createAndAppend("BR", '', '', '', '', fForm);



      createAndAppend('h1', 'pads', '', 'Pads mapping', "", fForm);
      createAndAppend('p', 'devicePadInstruction', '', 'Leaving focus in one field and sending a MIDI message will associate the MIDI pad/button with SuperMidi button.', "", fForm);

      let fLabelpadCount = createEl('Label', 'lblPadCount', '', 'Number of pads');
      fLabelpadCount.setAttribute("for", "selectPadCount");

      let selEl = createEl('select', 'selectPadCount', 'selectPadCount', '', '');
      selEl.onchange = (e) => this.changeselect(e);
      Array(8).fill().map((_, i) => createSelectOption(pow(2, i), pow(2, i), selEl));
      createSelectOption("Other", "Other", selEl);

      [].forEach.call(document.querySelectorAll('#selectPadCount :checked'), elm => this.padCount = elm.value);

      let fInputPadCount = createEl('input', "fInputPadCount", 'fInputPadCount', '', 'text');
      fInputPadCount.style.visibility = 'hidden';
      fForm.appendChild(fLabelpadCount);
      fForm.appendChild(selEl);
      fForm.appendChild(fInputPadCount);
      createAndAppend("BR", '', '', '', '', fForm);

      for (let i = 0; i < this.padCount; i++) {
         let fInput = createEl('input', "jsonPad_" + i, 'pad_' + i, '', "text");
         fInput.dataset.export = "true";
         fInput.dataset.exportArray = "pads";
         fInput.className = "inputSmall";
         let fLabel = createEl('Label', '', 'PAD ' + i, 'PAD ' + i, '');
         fLabel.setAttribute("for", "jsonPad_" + i);
         fLabel.className = "labelSmall";
         fForm.appendChild(fLabel);
         fForm.appendChild(fInput);
         if (i % 2 == 1)
            createAndAppend("BR", '', '', '', '', fForm);
      }

      let fButtonSub = d.createElement("input");
      fButtonSub.innerHTML = "Submit";
      fButtonSub.setAttribute('type', 'submit');
      fButtonSub.onclick = () => this.handleFormSubmit();
      createAndAppend("BR", '', '', '', '', fForm);
      fForm.appendChild(fButtonSub);


      fDivOuter.appendChild(fDivMiddle);
      fDivMiddle.appendChild(fDiv);
      fDiv.appendChild(fForm);

      fForm.addEventListener('submit', dummy);
      document.body.appendChild(fDivOuter);

      this.loadExisting(this.controller.Config);
   }


}

class SuperMidi {
   constructor() {



      this.MidiOut = null;
      this.MidiInputs = [];
      this.MidiOuputs = [];
      this.knobSet = new KnobSet();
      this.padSet = null;
      this._MidiChangedTriggers = [];
      this._MidiMessageTriggers = [];
      this.Config = null;
      this.configPanel = null;
      this.initialized = false;


   }

   onMidiChanged(callback) {
      //TODO clear is hack
      //this._MidiChangedTriggers = [];
      if (this._MidiChangedTriggers.includes(callback)) {
         console.log("Ignoring attempt to subscribe to evnet!");
      } else
         this._MidiChangedTriggers.push(callback);
   }

   onMidiMessage(callback) {
      this._MidiMessageTriggers.push(callback);
   }

   onMidiChangedHandler(params) {
      if (this._MidiChangedTriggers) {
         this._MidiChangedTriggers.forEach(callback => callback(params));
      }
   }

   onMidiMessageHandler(params) {
      if (this._MidiMessageTriggers) {
         for (let i in this._MidiMessageTriggers)
            this._MidiMessageTriggers[i](params);
      }
   }

   getMIDIMessage(midiMessage) {
      let data = midiMessage.data; // Uint8Array(3)
      this.onMidiMessageHandler(midiMessage); //broadcasting message

      this.padSet.updateByMessage(data);

      let ix = PadSet.ixFromNotes(data);
      let pad = this.padSet.pads[ix];
      if (pad) {
         console.log("Pressed " + this.padSet.pads[ix].name);


      }
   }


   onMIDIFailure(error) {

      console.error('Could not access your MIDI devices.');
      console.error(error);

   }


   /**
    * 
    * @param {The id of the device for which the configurations must be loaded.} deviceId 
    */
   loadConfiguration(deviceId) {
      //console.group(`🖍️  [SuperMidi Configurator]`);
      console.debug(`Loading configuration for device '${deviceId}'.`);
      for (let input of this.MidiInputs.values()) {
         if (input.id == deviceId) {
            let configurator = new Configurator();
            return configurator.getConfigurationOnline(input.manufacturer, input.name)
               .then(c => this.Config = new Configuration(c))
               .catch(e => this.configFromStorage(input.manufacturer, input.name))
               .then(() => this.padSet = new PadSet(PAD_MODE.RADIO, this.Config.pads))
               .catch(e => this.configManually(input));
            break;
         }
      }
      console.groupEnd();
   }


   configFromStorage(manufacturer, name) {

      return new Promise((resolve, reject) => {
         this.Config = Configurator.getFromStorage(manufacturer, name);
         if (this.Config) {
            console.log(`Loading from local storage... %cfound!`, 'color: #008f68;');
            this.initialized = true;
            resolve();
         } else {
            throw "Loading from local storage: not found!"; //rejects
            
         }
      });
   }



   configManually(input) {
      if (this.configPanel)
         this.configPanel.closeForm();

      this.configPanel = new ConfigPanel(this, input);

   };


   /**
    * Call back for when MIDI controller is successfully connected.
    * @param {} midiAccess 
    */
   onMIDISuccess(midiAccess) {

      midiAccess.onstatechange = (e) => {
         //TODO Should code handle also other connection values? (closed)
         if (e.port.connection == 'pending')
            return;

         // Print information about the (dis)connected MIDI controller
         console.log(e.port.connection, e.port.name, e.port.manufacturer, e.port.state);
         this.MidiInputs = midiAccess.inputs;
         this.MidiOutputs = midiAccess.outputs;
         this.onMidiChangedHandler(e);
      };


      this.MidiInputs = midiAccess.inputs;
      this.MidiOutputs = midiAccess.outputs;


      for (var input of midiAccess.inputs.values()) {
         input.onmidimessage = (msg) => this.getMIDIMessage(msg);
      }



      if (this.MidiOutputs == null)
         console.error("No MIDI output found!");





      /*
         var resetMsg = getResetMessage();
      this.LaunchControlOut.send(resetMsg);
      var setTemplateMsg = getSetTemplateMessage();
      this.LaunchControlOut.send(setTemplateMsg);
      console.log("MIDI controller reset!");
*/
   }



   init() {
      if (!navigator.requestMIDIAccess) {
         let msg = "SuperMidiJS will not work here :( " +
            " The MIDI API is not supported in this browser. " +
            " To use this library, please switch to a support browser, such as Chrome. " +
            " For a list of supported browsers, check https://caniuse.com/#feat=midi";

         alert(msg);
         console.error(msg);
         return;
      }
      navigator.requestMIDIAccess({
            sysex: true
         })
         .then((midiAccess) => this.onMIDISuccess(midiAccess), this.onMIDIFailure);
   }

}

export { SuperMidi };
