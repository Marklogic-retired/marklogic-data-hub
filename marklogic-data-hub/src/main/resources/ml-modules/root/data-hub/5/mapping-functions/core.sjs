/*
  Copyright 2012-2019 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
/*
 * Consolidation of core function extensions for declarative mapping. One core library reduces the number of XSLT imports and helps performance.
 */
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

// BEGIN value lookup functions
// cache string dictionaries to avoid parsing JSON repeatedly
const cachedStringToDictionary = {};
const caseInsensitiveGetterSetter = {
  get: (obj, key) => obj[key.toLowerCase()],
  set: (obj, key, value) => {
    obj[key.toLowerCase()] = value;
    return true;
  }
};

function memoryLookup(input, inputDictionary) {
  let dictionary;
  if (typeof inputDictionary === 'string' || inputDictionary instanceof xs.string) {
    if (cachedStringToDictionary[inputDictionary]) {
      dictionary = cachedStringToDictionary[inputDictionary];
    } else {
      try {
        dictionary = new Proxy({}, caseInsensitiveGetterSetter);
        Object.assign(dictionary, JSON.parse(inputDictionary));
        cachedStringToDictionary[inputDictionary] = dictionary;
      } catch (e) {
        cachedStringToDictionary[dictionary] = e;
        dictionary = e;
      }
    }
  } else if (inputDictionary instanceof Object) {
    dictionary = new Proxy({}, caseInsensitiveGetterSetter);
    Object.assign(dictionary, inputDictionary);
  } else {
    let errMsg = `Expected JSON string or object. Received type: ${typeof inputDictionary}`;
    datahub.debug.log({message: errMsg, type: 'error'});
    throw new Error(errMsg);
  }
  if (dictionary instanceof Error) {
    datahub.debug.log({message: dictionary.message, type: 'error'});
    throw dictionary;
  }
  let lookupValue = dictionary[input];
  if (!lookupValue) {
    datahub.debug.log({message: `Lookup value not found for '${input}' with dictionary '${xdmp.describe(inputDictionary)}'`, type: 'warning'});
  }
  return lookupValue;
}

function documentLookup(input, inputDictionaryPath) {
  if (!fn.docAvailable(inputDictionaryPath)) {
    let errMsg = `Dictionary not found at '${inputDictionaryPath}'`;
    datahub.debug.log({message: errMsg, type: 'error'});
    throw new Error(errMsg);
  }
  let dictionaryDoc = cts.doc(inputDictionaryPath);
  if (!(dictionaryDoc.root instanceof ObjectNode)) {
    let errMsg = `Dictionary at '${inputDictionaryPath}' is not a JSON Object`;
    datahub.debug.log({message: errMsg, type: 'error'});
    throw new Error(errMsg);
  }
  return memoryLookup(input, dictionaryDoc.toObject());
}
// END value lookup functions

// BEGIN date/dateTime functions
function parseDate(picture, value) {
  let standardFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM.DD.YYYY", "DD.MM.YYYY", "YYYYMMDD", "YYYY/MM/DD"];
  let nonStandardFormats = ["Mon DD, YYYY", "DD Mon YYYY", "DD-Mon-YYYY" ];
  let response;
  if(standardFormats.includes(picture.trim())){
    try{
      let standardizedDate = xdmp.parseYymmdd(picture.replace("YYYY", "yyyy").replace("DD","dd"), value).toString().split("T")[0];
      response = xs.date(standardizedDate);
    }
    catch (ex) {
      fn.error(null, "Given value doesn't match with the specified pattern (" + picture + "," + value + ") for parsing date string.");
    }
  }
  else if (nonStandardFormats.includes(picture.trim())) {
    picture = picture.trim();
    let pattern;
    if(picture === nonStandardFormats[0]) {
      pattern = "^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-9]|[0-2][0-9]|[3][0-1])\, ([0-9]{4})$";
    }
    else if(picture === nonStandardFormats[1]) {
      pattern = "^([0-9]|[0-2][0-9]|[3][0-1]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-9]{4})$";
    }
    else {
      pattern = "^([0-9]|[0-2][0-9]|[3][0-1])\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-([0-9]{4})$";
    }
    let match = new RegExp(pattern, 'i').exec(value);
    if (match === null) {
      fn.error(null, "Given value doesn't match with the specified pattern (" + picture + "," + value + ") for parsing date string.");
    }
    else {
      let date = new Date(value);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      if(isNaN(date) || isNaN(day) || isNaN(month)) {
        fn.error(null, "Given value (" + value + ") for date string is invalid.");
      }
      else {
        let year = date.getFullYear();
        day = day < 10 ? "0".concat(day) : day;
        month = month < 10 ? "0".concat(month) : month;
        response = xs.date(year + "-" + month + "-" + day);
      }
    }
  }
  else {
    fn.error(null, "The given date pattern (" + picture + ") is not supported.");
  }
  return response;
}

function parseDateTime(picture, value) {
  let supportedFormats = ["YYYYMMDDThhmmss", "DD/MM/YYYY-hh:mm:ss", "DD/MM/YYYY hh:mm:ss", "YYYY/MM/DD-hh:mm:ss" , "YYYY/MM/DD hh:mm:ss"];
  let response;
  if(supportedFormats.includes(picture.trim())){
    try {
      response = xdmp.parseYymmdd(picture.replace("YYYY","yyyy").replace("DD","dd"), value);
    }
    catch(ex){
      fn.error(null, ex.message);
    }
  }
  else{
    fn.error(null, "The given dateTime pattern (" + picture + ") is not supported.");
  }
  return response;
}
// END date/dateTime functions

module.exports = {
  memoryLookup,
  documentLookup,
  parseDate,
  parseDateTime
};
