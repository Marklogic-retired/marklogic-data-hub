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

// Build and return the sourceProperties portion/array of getDocumentForTesting's return.
function buildSourceProperties(sourceData, isJson) {
  const outputArr = [];
  addSourceProperties(sourceData, isJson, outputArr, '', 0)
  return outputArr;
}

// Recursively process sourceData, populating a flat array of its source properties.
function addSourceProperties(sourceData, isJson, outputArr, outputArrKey = '', level = 0) {
  let value, valueIsObject, valueIsArray, xpath;
  for (let key of Object.keys(sourceData)) {
    // sourceProperties is not to receive the #text properties.
    if (key === require('./xmlToJsonForMapping.sjs').PROP_NAME_TEXT) { continue }

    value = sourceData[key];
    valueIsObject = isObject(value);
    valueIsArray = isArray(value);
    xpath = makeSafeXPathExpression(outputArrKey, key, value, isJson, valueIsArray);
    outputArr.push({
      name: key,
      xpath: xpath,
      struct: valueIsObject,
      level: level
    })
    if (valueIsObject && !valueIsArray) {
      addSourceProperties(value, isJson, outputArr, `${outputArrKey}/${key}`, level + 1);
    }
  }
}

/**
 * Construct an XPath, accounting for invalid qualified names, which is possible when the source format is JSON.
 * For example, if nextPart is "$myName" where "$" is not an allowed character in a qualified name, the returned
 * XPath expression would include "array-node('$myName') when true and values within are believed to be atomic; else,
 * "node('$myName')" would end the XPath expression.
 *
 * @param {string} leadingPath - The beginning of the XPath expression.  Used as given.
 * @param {string} nextPart - The bit to append to the XPath expression, in one of several ways, influenced by other parameters.
 * @param {object} value - The value the XPath expression points to.
 * @param {boolean} isJson - Submit true when the source document's format is JSON.
 * @param {boolean} isArray - Pre-determination of whether value is an array.
 * @returns {string} - An XPath expression where an invalid qualified name is wrapped in either array-node() or node().
 */
function makeSafeXPathExpression(leadingPath, nextPart, value, isJson, isArray) {
  let funcStart = '';
  let funcEnd = '';
  if (isJson && !isValidQName(nextPart)) {
    // Array of atomic values
    if (isArray && value.length > 0 && isAtomic(value[0])) {
      funcStart = "array-node('";
      funcEnd = "')/node()";
    } else {
      // Either not an array, an empty array, or an array of object values.
      funcStart = "node('";
      funcEnd = "')";
    }
  }
  return `${leadingPath}/${funcStart}${nextPart}${funcEnd}`;
}

function isValidQName(name) {
  try {
    fn.QName('', name);
    return true;
  } catch (e) {
    return false;
  }
}

function isObject(value) {
  // Added key criteria as typeof(value) returned 'object' for some scalar values.
  return (value && typeof(value) === 'object' && Object.keys(value).length > 0) === true;
}

function isAtomic(value) {
  return !isObject(value);
}

function isArray(value) {
  // False negatives from Array.isArray(value)
  return value && value.hasOwnProperty('0');
}

exports.buildSourceProperties = buildSourceProperties;
