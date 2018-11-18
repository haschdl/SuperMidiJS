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
   createSelectOption,
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

   constructor(controller) {
      this.controller = controller;
      this.lastMessageTimeStamp = 0;
      this.padCount = 8;

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

      this.controller.onMidiChanged((data) => {
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

      if (this.controller.Config)
         this.padCount = Object.keys(this.controller.Config.pads).length;
      this.buildForm();
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
      const data = formToJSON(form.elements);

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


      let fInput2 = createEl('input', 'jsonName', 'name', '', 'text');
      let fLabel2 = createEl('Label', 'lblName', 'lblName', 'Device name');
      fLabel2.setAttribute("for", "name");


      fForm.appendChild(fLabel2);
      fForm.appendChild(fInput2);
      createAndAppend("BR", '', '', '', '', fForm);

      let fInput = createEl('input', "jsonManufacturer", 'manufacturer', '', 'text');
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