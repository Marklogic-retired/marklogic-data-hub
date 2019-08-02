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
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
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

module.exports = {
  memoryLookup: memoryLookup,
  documentLookup: documentLookup
};
