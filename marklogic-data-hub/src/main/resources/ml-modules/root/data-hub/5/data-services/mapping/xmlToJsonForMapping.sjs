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
const textStartsWith = '#';
const textPropName = textStartsWith + 'text';
const attrStartsWith = '@';
const outputAttrStartsWith = '@'; // in case this ever needs to vary from the input.
const nsPrefixDelim = ':';
const nsAttrStartsWith = attrStartsWith + 'xmlns';
const defaultNSAttrName = nsAttrStartsWith;
const nonDefaultNSAttrStartsWith = nsAttrStartsWith + nsPrefixDelim

// Set up for parser
const parser = require('/data-hub/third-party/fast-xml-parser/src/parser.js');
const parserOptions = {
  attributeNamePrefix: attrStartsWith,
  attrNodeName: false, //default is 'false'
  textNodeName: textPropName,
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

function _isAttr(name) {
  return name.startsWith(attrStartsWith);
}

function _isNSAttr(name) {
  return name.startsWith(nsAttrStartsWith);
}

function _isObject(value) {
  return value !== null && typeof(value) === 'object';
}

/**
 * Get information about the provided value.  Originally intended to help determine if a value is scalar, and if so,
 * serve up additional information so as not to inspect the object multiple times.
 *
 * @param value
 * @returns {{defaultNS: object, isArray: boolean, isScalar: boolean, value: object}}
 * @private
 */
function _getValueInfo(value) {
  let isScalar = true;
  let defaultNS = null;
  if (_isObject(value)) {
    for (let key of Object.keys(value)) {
      if (!key.startsWith(textStartsWith) && !key.startsWith(nsAttrStartsWith)) {
        isScalar = false;
      }
      if (key === defaultNSAttrName) {
        defaultNS = {
          prefix: _determineFinalNSPrefix(null, value[key]),
          uri: value[key]
        }
      }
    }
  }
  if (isScalar && value.hasOwnProperty(textPropName)) {
    value = value[textPropName];
  }
  return {
    isArray: isScalar ? false : Array.isArray(value),
    isScalar: isScalar,
    value: value,
    defaultNS: defaultNS
  }
}

// An indirectly recursive function.
function _transform(jsonIn, defaultNS, jsonOut) {
  for (let key of Object.keys(jsonIn)) {
    if (_isAttr(key)) {
      _transformAttr(jsonOut, key, jsonIn[key], defaultNS);
    } else {
      _transformObject(jsonOut, key, jsonIn[key], defaultNS);
    }
  }
  return jsonOut;
}

function _transformAttr(jsonOut, attrName, value, defaultNS) {
  if (_isNSAttr(attrName)) {
    _conditionallyCollectNonDefaultNSs();
  } else {
    // Strip input indicator that this is an attribute.
    if (attrName.startsWith(attrStartsWith)) {
      attrName = attrName.substr(attrStartsWith.length);
    }

    // Fully qualify the attribute name.
    attrName = _getQName(attrName, true, defaultNS);

    jsonOut[outputAttrStartsWith + attrName] = value;
  }
}

function _transformObject(jsonOut, objName, value, defaultNS) {
  // Did the default namespace change?
  if (value.hasOwnProperty(defaultNSAttrName)) {
    _conditionallyCollectNonDefaultNSs();
    defaultNS = {
      prefix: _determineFinalNSPrefix(null, value[defaultNSAttrName]),
      uri: value[defaultNSAttrName]
    }
  }

  // Fully qualify the object name.
  objName = _getQName(objName, false, defaultNS);

  const valueInfo = _getValueInfo(value);
  if (valueInfo.isScalar === true) {
    jsonOut[objName] = valueInfo.value;
  } else if (valueInfo.isArray === true) {
    // Allow this function to modify jsonObj as objName may need to change and output may not end up being an array.
    defaultNS = _transformArray(jsonOut, objName, value, defaultNS);
  } else {
    jsonOut[objName] = {};
    _transform(value, defaultNS, jsonOut[objName]);
  }
}

function _transformArray(jsonOut, objName, value, defaultNS) {
  let arr = [], valueInfo;
  for (let i = 0; i < value.length; i++) {
    valueInfo = _getValueInfo(value[i]);
    if (valueInfo.isScalar) {
      // When the namespace doesn't change, just add to the array.
      if (_isSameNS(defaultNS, valueInfo.defaultNS)) {
        arr.push(valueInfo.value);
      } else {
        // Else, add array to jsonOut and set up for the next one.
        _addArray(jsonOut, objName, arr);
        arr = [valueInfo.value];
        defaultNS = valueInfo.defaultNS;
        objName = _getQName(objName, false, defaultNS, true);
      }
    } else {
      arr.push(_transform(value[i], defaultNS, {}))
    }
  }
  _addArray(jsonOut, objName, arr);
  return defaultNS;
}

function _addArray(jsonOut, objName, arr) {
  if (arr.length > 0) {
    jsonOut[objName] = arr.length === 1 ? arr[0] : arr;
  }
}

function _isSameNS(ns1, ns2) {
  if (ns1 === null && ns2 === null) {
    return true;
  } else if ((ns1 !== null && ns2 === null) || (ns1 === null && ns2 !== null)) {
    return false;
  }
  return ns1.uri === ns2.uri;
}

// Traverse doc to collect namespaces with prefixes.  Zero or once per request.
function _conditionallyCollectNonDefaultNSs() {
  if (collectedNonDefaultNSs === false) {
    _collectNonDefaultNSs(jsonIn);
    collectedNonDefaultNSs = true;
  }
}

// Only expected caller is conditionallyCollectNonDefaultNSs()
function _collectNonDefaultNSs(obj) {
  for (let key of Object.keys(obj)) {
    if (_isAttr(key)) {
      if (key.startsWith(nonDefaultNSAttrStartsWith)) {
        _determineFinalNSPrefix(key.substr(nonDefaultNSAttrStartsWith.length), obj[key]);
      }
    } else if (_isObject(obj[key])) {
      _collectNonDefaultNSs(obj[key]);
    }
  }
}

function _determineFinalNSPrefix(currentPrefix, uri) {
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

function _getFinalNSPrefix(currentPrefix, uri) {
  // Non-default namespace (prefix defined)
  if (currentPrefix !== null) {
    if (prefixMap.hasOwnProperty(currentPrefix)) {
      return prefixMap[currentPrefix];
    }
    return currentPrefix;
  }
  // Default namespace (prefix not defined)
  return _determineFinalNSPrefix(currentPrefix, uri);
}

function _getQName(name, isAttr, defaultNS, preferDefaultNS = false) {
  let finalPrefix = null;
  const idx = name.indexOf(nsPrefixDelim);
  if (idx !== -1) {
    const currentPrefix = name.substr(0, idx);
    name = name.substr(idx + 1);

    // Change to the default NS when there is one and told it is preferred.
    if (preferDefaultNS && defaultNS !== null) {
      finalPrefix = defaultNS.prefix;
    } else if (!(isAttr && defaultNS !== null && currentPrefix === defaultNS.prefix)) {
      // Add a prefix as this is not an attribute in the default namespace (no prefix desired in that case).
      finalPrefix = _getFinalNSPrefix(currentPrefix, null);
    }
  } else if (!isAttr && name !== textPropName && defaultNS !== null) {
    finalPrefix = defaultNS.prefix;
  }

  return (finalPrefix ? finalPrefix + nsPrefixDelim : '') + name;
}

// These global variables pertain to collecting namespaces defined within the provided XML.
// Only performed once upon encountering the first namespace attribute.
let jsonIn;
let collectedNonDefaultNSs = false;
const namespaces = {};
const prefixMap = {};

/**
 * Transform the XML to JSON, returning that JSON and namespaces.
 *
 * @param xmlNode
 * @returns {{data: *, namespaces: {}}}
 */
function transform(xmlNode) {
  const serializeOptions = {indent: 'no'};
  jsonIn = parser.parse(xdmp.quote(xmlNode, serializeOptions), parserOptions);
  return {
    data: _transform(jsonIn, null, {}),
    namespaces: namespaces
  }
}
exports.transform = transform;
