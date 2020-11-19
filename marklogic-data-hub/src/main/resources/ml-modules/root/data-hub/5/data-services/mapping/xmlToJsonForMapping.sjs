/**
 Copyright (c) 2020 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

// Global constants
const PROP_NAME_TEXT_STARTS_WITH = '#';
const PROP_NAME_TEXT = PROP_NAME_TEXT_STARTS_WITH + 'text';
const PROP_NAME_ATTR_STARTS_WITH = '@';
const DELIM_NS_PREFIX = ':';
const PROP_NAME_NS_ATTR_STARTS_WITH = PROP_NAME_ATTR_STARTS_WITH + 'xmlns';
const ATTR_NAME_DEFAULT_NS = PROP_NAME_NS_ATTR_STARTS_WITH;
const ATTR_NAME_NON_DEFAULT_NS_STARTS_WITH = PROP_NAME_NS_ATTR_STARTS_WITH + DELIM_NS_PREFIX;

// These global variables pertain to collecting namespaces defined within the provided XML.
// Only performed once upon encountering the first namespace attribute.
// Not compatible with MSJ.
let jsonIn;
let collectedNonDefaultNSs = false;
const namespaces = {};
const prefixMap = {};

// Set up for parser
const parser = require('/data-hub/third-party/fast-xml-parser/src/parser.js');
const parserOptions = {
  attributeNamePrefix: PROP_NAME_ATTR_STARTS_WITH,
  attrNodeName: false, //default is 'false'
  textNodeName: PROP_NAME_TEXT,
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: '', //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  arrayMode: 'strint'
};

/**
 * Transform the XML to JSON, returning that JSON and namespaces.
 *
 * @param xmlNode
 * @returns {{data: *, namespaces: {}}}
 */
function transformXml(xmlNode) {
  const serializeOptions = {indent: 'no'};
  jsonIn = parser.parse(xdmp.quote(xmlNode, serializeOptions), parserOptions);
  return {
    data: transformJson(jsonIn, null, {}),
    namespaces: namespaces
  }
}

// An indirectly recursive function.
function transformJson(jsonIn, defaultNS, jsonOut) {
  for (let key of Object.keys(jsonIn)) {
    if (isAttr(key)) {
      transformAttr(jsonOut, key, jsonIn[key], defaultNS);
    } else {
      transformObject(jsonOut, key, jsonIn[key], defaultNS);
    }
  }
  return jsonOut;
}

function transformAttr(jsonOut, attrName, value, defaultNS) {
  if (isNSAttr(attrName)) {
    conditionallyCollectNonDefaultNSs();
  } else {
    // Strip input indicator that this is an attribute.
    if (attrName.startsWith(PROP_NAME_ATTR_STARTS_WITH)) {
      attrName = attrName.substr(PROP_NAME_ATTR_STARTS_WITH.length);
    }

    // Fully qualify the attribute name.
    attrName = PROP_NAME_ATTR_STARTS_WITH + getQName(attrName, true, defaultNS);

    jsonOut[attrName] = value;
  }
}

function transformObject(jsonOut, objName, value, defaultNS) {
  // Did the default namespace change?
  if (value.hasOwnProperty(ATTR_NAME_DEFAULT_NS)) {
    conditionallyCollectNonDefaultNSs();
    defaultNS = {
      prefix: determineFinalNSPrefix(null, value[ATTR_NAME_DEFAULT_NS]),
      uri: value[ATTR_NAME_DEFAULT_NS]
    }
  }

  // Fully qualify the object name.
  objName = getQName(objName, false, defaultNS);

  const valueInfo = getValueInfo(value);
  if (valueInfo.isAtomic) {
    jsonOut[objName] = valueInfo.value;
  } else if (valueInfo.isArray) {
    // Allow this function to modify jsonObj as objName may need to change and output may not end up being an array.
    defaultNS = transformArray(jsonOut, objName, value, defaultNS);
  } else {
    jsonOut[objName] = {};
    transformJson(value, defaultNS, jsonOut[objName]);
  }
}

function transformArray(jsonOut, objName, value, defaultNS) {
  let arr = [], valueInfo;
  for (let i = 0; i < value.length; i++) {
    valueInfo = getValueInfo(value[i]);
    if (valueInfo.isAtomic) {
      // When the namespace doesn't change, just add to the array.
      if (isSameNS(defaultNS, valueInfo.defaultNS)) {
        arr.push(valueInfo.value);
      } else {
        // Else, add array to jsonOut and set up for the next one.
        addArray(jsonOut, objName, arr);
        arr = [valueInfo.value];
        defaultNS = valueInfo.defaultNS;
        objName = getQName(objName, false, defaultNS, true);
      }
    } else {
      arr.push(transformJson(value[i], defaultNS, {}))
    }
  }
  addArray(jsonOut, objName, arr);
  return defaultNS;
}

function addArray(jsonOut, objName, arr) {
  if (arr.length > 0) {
    jsonOut[objName] = arr.length === 1 ? arr[0] : arr;
  }
}

/**
 * Get information about the provided value.  Originally intended to help determine if a value is atomic, and if so,
 * serve up additional information so as not to inspect the object multiple times.
 *
 * @param value
 * @returns {{defaultNS: object, isArray: boolean, isAtomic: boolean, value: object}}
 * @private
 */
function getValueInfo(value) {
  let isAtomic = true;
  let defaultNS = null;
  if (isObject(value)) {
    for (let key of Object.keys(value)) {
      if (!key.startsWith(PROP_NAME_TEXT_STARTS_WITH) && !key.startsWith(PROP_NAME_NS_ATTR_STARTS_WITH)) {
        isAtomic = false;
      }
      if (key === ATTR_NAME_DEFAULT_NS) {
        defaultNS = {
          prefix: determineFinalNSPrefix(null, value[key]),
          uri: value[key]
        }
      }
    }
  }
  if (isAtomic && value.hasOwnProperty(PROP_NAME_TEXT)) {
    value = value[PROP_NAME_TEXT];
  }
  return {
    isArray: isAtomic ? false : Array.isArray(value),
    isAtomic: isAtomic,
    value: value,
    defaultNS: defaultNS
  }
}

// Traverse doc to collect namespaces with prefixes.  Zero or once per request.
function conditionallyCollectNonDefaultNSs() {
  if (collectedNonDefaultNSs === false) {
    collectNonDefaultNSs(jsonIn);
    collectedNonDefaultNSs = true;
  }
}

// Only expected caller is conditionallyCollectNonDefaultNSs()
function collectNonDefaultNSs(obj) {
  for (let key of Object.keys(obj)) {
    if (isAttr(key)) {
      if (key.startsWith(ATTR_NAME_NON_DEFAULT_NS_STARTS_WITH)) {
        determineFinalNSPrefix(key.substr(ATTR_NAME_NON_DEFAULT_NS_STARTS_WITH.length), obj[key]);
      }
    } else if (isObject(obj[key])) {
      collectNonDefaultNSs(obj[key]);
    }
  }
}

function determineFinalNSPrefix(currentPrefix, uri) {
  let finalPrefix = null;

  // Starting point is the current prefix, when given.
  if (currentPrefix) {
    finalPrefix = currentPrefix;
  } else { // Else start with the last part of the URI.
    const idx = uri.lastIndexOf('/');
    finalPrefix = idx === -1 ? uri : uri.substr(idx + 1);
  }

  // See if we need to add a counter to the prefix (e.g., "definedPrefix2" when
  // "definedPrefix" is already defined but with a different namespace URI).
  const attemptsMax = 10;
  let attemptsCurrent = 1,
    key,
    value;
  const keys = Object.keys(namespaces);
  // Going by array length as we may restart the loop (up to attemptsMax times).
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    value = namespaces[key];
    if (uri === value) {
      return key;
    }
    if (key === finalPrefix) {
      if (attemptsCurrent >= attemptsMax) {
        fn.error(xs.QName('ERROR'), `Unable to determine a unique namespace prefix for the ${value} URI after ${attemptsMax} attempts.`);
      }
      // Set up to try again.
      if (finalPrefix.endsWith(attemptsCurrent)) {
        finalPrefix = finalPrefix.substr(0, finalPrefix.length - new String(attemptsCurrent).length);
      }
      attemptsCurrent++;
      finalPrefix += attemptsCurrent;
      i = 0;
      continue;
    }
  }

  if (finalPrefix.length > 0) {
    // Retain for future use.
    namespaces[finalPrefix] = uri;
    if (currentPrefix !== null) {
      prefixMap[currentPrefix] = finalPrefix;
    }
  }

  return finalPrefix;
}

function getFinalNSPrefix(currentPrefix, uri) {
  // Non-default namespace (prefix defined)
  if (currentPrefix !== null) {
    if (prefixMap.hasOwnProperty(currentPrefix)) {
      return prefixMap[currentPrefix];
    }
    return currentPrefix;
  }
  // Default namespace (prefix not defined)
  return determineFinalNSPrefix(currentPrefix, uri);
}

function getQName(name, isAttr, defaultNS, preferDefaultNS = false) {
  let finalPrefix = null;
  const idx = name.indexOf(DELIM_NS_PREFIX);
  if (idx !== -1) {
    const currentPrefix = name.substr(0, idx);
    name = name.substr(idx + 1);

    // Change to the default NS when there is one and told it is preferred.
    if (preferDefaultNS && defaultNS !== null) {
      finalPrefix = defaultNS.prefix;
    } else if (!(isAttr && defaultNS !== null && currentPrefix === defaultNS.prefix)) {
      // Add a prefix as this is not an attribute in the default namespace (no prefix desired in that case).
      finalPrefix = getFinalNSPrefix(currentPrefix, null);
    }
  } else if (!isAttr && name !== PROP_NAME_TEXT && defaultNS !== null) {
    finalPrefix = defaultNS.prefix;
  }

  return (finalPrefix ? finalPrefix + DELIM_NS_PREFIX : '') + name;
}

function isSameNS(ns1, ns2) {
  if (ns1 === null && ns2 === null) {
    return true;
  } else if ((ns1 !== null && ns2 === null) || (ns1 === null && ns2 !== null)) {
    return false;
  }
  return ns1.uri === ns2.uri;
}

function isAttr(name) {
  return name.startsWith(PROP_NAME_ATTR_STARTS_WITH);
}

function isNSAttr(name) {
  return name.startsWith(PROP_NAME_NS_ATTR_STARTS_WITH);
}

function isObject(value) {
  return value !== null && typeof(value) === 'object';
}

exports.transform = transformXml;
exports.PROP_NAME_TEXT = PROP_NAME_TEXT;
