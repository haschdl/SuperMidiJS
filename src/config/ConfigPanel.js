import {
   Configurator
} from '../Configurator.js';
//http://jsfiddle.net/ka0yn8Lv/34/


function addStyleString(str) {
   var node = document.createElement('style');
   node.innerHTML = str;
   document.body.appendChild(node);
}

export class ConfigPanel {
   constructor(parent) {
      this.parent = parent;
      this.lastMessageTimeStamp = 0;

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
         if (elId.startsWith('config_') && curr.type == "text") {
            document.activeElement.value = text;
         }


         let nextField = document.activeElement.nextSibling;
         while (nextField) {
            if (nextField.type && nextField.type == "text") {
               nextField.focus();
               break;
            }
            nextField = nextField.nextSibling;
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

   static removeElement(elementId) {
      let elet = document.getElementById(elementId);
      elet.parentNode.removeChild(elet);
   }

   static superMidiSaveConfig() {
      ConfigPanel.removeElement("formSuperMidiConfig");
   }

   closeForm() {
      //this.parent = null;
      ConfigPanel.removeElement("formSuperMidiConfig");
   }



   buildForm() {
      let lastMessageTimeStamp = Date.now();


      /**
       * Retrieves input data from a form and returns it as a JSON object.
       * @param  {HTMLFormControlsCollection} elements  the form elements
       * @return {Object}                               form data as an object literal
       */
      let formToJSON = elements => [].reduce.call(elements, (data, element) => {
         if (!element.name)
            return data;
         if (element.name.startsWith("PAD")) {
            if (!data["PADS"])
               data["PADS"] = [];

            let val = element.value || "[]";

            data["PADS"].push(JSON.parse(val));
         } else
            data[element.name] = element.value;

         return data;

      }, {});

      /**
       * A handler function to prevent default submission and run our custom script.
       * @param  {Event} event  the submit event triggered by the user
       * @return {void}
       */
      let handleFormSubmit = (event) => {
         console.log("Handling form submission");
         const form = document.getElementById("formSuperMidiConfig");

         // Stop the form from submitting since we’re handling that with AJAX.
         event.preventDefault();

         const data = formToJSON(form.elements);

         // Use `JSON.stringify()` to make the output valid, human-readable JSON.

         console.dir(data);

         Configurator.saveToStorage(data);

      }



      let createEl = (tag, id, name, innerHtml, type) => {
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
      let createAndAppend = (tag, id, name, innerHtml, type, appendTo) => {
         let el = createEl(tag, id, name, innerHtml, type)
         appendTo.appendChild(el);
      }

      let d = document;
      console.log("Fallback to manual configuration from form.");

      let fForm = createEl('form', 'formSuperMidiConfig');
      let fDiv = createEl('div', "formDivSuperMidi", );

      createAndAppend('h1', 'deviceInfo', '', 'Device information', "", fDiv);
      createAndAppend('h3', 'deviceInfoInstruction', '', 'Reconnecting a MIDI device will populate manufacturer and port name.', "", fDiv);


      let fInput2 = createEl('input', 'name', 'name', '', 'text');
      let fLabel2 = createEl('Label', 'lblName', 'lblName', 'Device name');
      fLabel2.setAttribute("for", "name");


      fDiv.appendChild(fLabel2);
      fDiv.appendChild(fInput2);
      createAndAppend("BR", '', '', '', '', fDiv);

      var fInput = createEl('input', "manufacturer", 'manufacturer', '', 'text');
      var fLabel = createEl('Label', 'lblManufacturer', '', 'Manufacturer');
      fLabel.setAttribute("for", "manufacturer");

      fDiv.appendChild(fLabel);
      fDiv.appendChild(fInput);
      createAndAppend("BR", '', '', '', '', fDiv);



      createAndAppend('h1', 'pads', '', 'Pads mapping', "", fDiv);
      createAndAppend('h3', 'devicePadInstruction', '', 'Leaving focus in one field and sending a MIDI message will associate the MIDI pad/button with SuperMidi button.', "", fDiv);

      for (let i = 0; i < 16; i++) {
         var fInput = createEl('input', "config_pad_" + i, 'PAD ' + i, '', "text");
         fInput.className = "inputSmall";
         let fLabel = createEl('Label', '', 'PAD ' + i, 'PAD ' + i, '');
         fLabel.setAttribute("for", "config_pad_" + i);
         fLabel.className = "labelSmall";
         fDiv.appendChild(fLabel);
         fDiv.appendChild(fInput);
         if (i % 2 == 1)
            createAndAppend("BR", '', '', '', '', fDiv);
      }

      let fButtonSub = d.createElement("BUTTON");
      fButtonSub.innerHTML = "Submit";
      fButtonSub.type = "submit";
      //fButtonSub.setAttribute("onclick", "superMidiSaveConfig()");
      createAndAppend("BR", '', '', '', '', fDiv);
      fDiv.appendChild(fButtonSub);
      fForm.appendChild(fDiv);

      fForm.addEventListener('submit', handleFormSubmit);



      document.body.appendChild(fForm);

   }
}