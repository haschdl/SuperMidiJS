export function removeElement(elementId) {
   let elet = document.getElementById(elementId);
   if (elet)
      elet.parentNode.removeChild(elet);
};

export function createEl(tag, id, name, innerHtml, type) {
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
export function createAndAppend(tag, id, name, innerHtml, type, appendTo) {
   let el = createEl(tag, id, name, innerHtml, type)
   appendTo.appendChild(el);
}

export function setValue(name, value) {
   let els = document.getElementsByName(name);
   if (els && els[0])
      els[0].value = JSON.stringify(value).replace(/\"/g, "");
};

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
export function formToJSON(elements) {
   return [].reduce.call(elements, (data, element) => {
      if (!element.name || !element.id.startsWith("json") )
         return data;

      if (element.id.startsWith("jsonPad")) {
         if (!data["pads"])
            data["pads"] = {};

         let val = element.value || "[]";
         data["pads"][element.name] = JSON.parse(val);
      } else
         data[element.name] = element.value;

      return data;

   }, {});
}

export function highlightDuplicates(text) {
   //checking for duplicates
   let inputs = document.querySelectorAll('input[type=text]');
   let possibleDups = Array.from(inputs).filter(el => el.value == text);

   if (possibleDups && possibleDups.length > 1) {
      possibleDups.forEach(el => el.classList.add('inputDuplicate'));
      return true;
   }
   return false;
}

export function createSelectOption(text, value, appendTo) {
   let opt = document.createElement("option");
   opt.value = value;
   opt.text = text;
   appendTo.appendChild(opt);
}