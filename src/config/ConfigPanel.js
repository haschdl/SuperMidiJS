import {
   Configuration
} from '../Configuration.js';

import {
   Configurator
} from '../Configurator.js';
import {
   ConfigPanelStyles
} from './ConfigPanelStyles.js';

import {
   removeElement,
   createAndAppend,
   createEl,
   setValue,
   formToJSON,
   highlightDuplicates
} from './DomUtils.js';



//http://jsfiddle.net/ka0yn8Lv/34/


function loadConfigPanelStyles() {
   var node = document.createElement('style');
   node.innerHTML = ConfigPanelStyles;
   document.body.appendChild(node);

}



export class ConfigPanel {

   constructor(parent) {
      this.parent = parent;
      this.lastMessageTimeStamp = 0;
      this.updateConfigurationPromise = null;
      this.configuration = null;



      //loadConfigPanelStyles();

      /***
       * Subscribing to MIDI messages from the SuperMidi
       */
      this.parent.onMidiMessage((midiMessage) => {
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

         let nextField = document.activeElement.nextSibling;
         if (elId.startsWith('config_') && curr.type == "text") {
            document.activeElement.value = text;
            document.activeElement.blur();
         }

         if (!highlightDuplicates(text)) {
            while (nextField) {
               if (nextField.type && nextField.type == "text") {
                  nextField.focus();
                  break;
               }
               nextField = nextField.nextSibling;
            }
         }
      });

      this.parent.onMidiChanged((data) => {
         this.lastMessageTimeStamp = 0;
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
         document.getElementById('manufacturer').value = metadata["m"];
         document.getElementById('name').value = metadata["n"];

      });
   }

   updateConfiguration(config) {
      this.updateConfigurationPromise = new Promise((resolve, reject) => {
         this.buildForm();
         if (config)
            this.loadExisting(config);
      });
      return this.updateConfigurationPromise;
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
      console.log("Handling form submission");
      const form = document.getElementById("formSuperMidiConfig");

      //event.preventDefault();
      const data = formToJSON(form.elements);

      console.dir(data);
      this.configuration = new Configuration(data);

      Configurator.saveToStorage(data);

      removeElement("formDivOuterSuperMidi");

      Promise.resolve(this.updateConfigurationPromise); //.resolve(this.configuration);

   }
   buildForm() {
      let dummy = () => false;

      let lastMessageTimeStamp = Date.now();


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


      let fInput2 = createEl('input', 'name', 'name', '', 'text');
      let fLabel2 = createEl('Label', 'lblName', 'lblName', 'Device name');
      fLabel2.setAttribute("for", "name");


      fForm.appendChild(fLabel2);
      fForm.appendChild(fInput2);
      createAndAppend("BR", '', '', '', '', fForm);

      var fInput = createEl('input', "manufacturer", 'manufacturer', '', 'text');
      var fLabel = createEl('Label', 'lblManufacturer', '', 'Manufacturer');
      fLabel.setAttribute("for", "manufacturer");

      fForm.appendChild(fLabel);
      fForm.appendChild(fInput);
      createAndAppend("BR", '', '', '', '', fForm);



      createAndAppend('h1', 'pads', '', 'Pads mapping', "", fForm);
      createAndAppend('p', 'devicePadInstruction', '', 'Leaving focus in one field and sending a MIDI message will associate the MIDI pad/button with SuperMidi button.', "", fForm);

      for (let i = 0; i < 16; i++) {
         var fInput = createEl('input', "config_pad_" + i, 'pad_' + i, '', "text");
         fInput.className = "inputSmall";
         let fLabel = createEl('Label', '', 'PAD ' + i, 'PAD ' + i, '');
         fLabel.setAttribute("for", "config_pad_" + i);
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
   }


}