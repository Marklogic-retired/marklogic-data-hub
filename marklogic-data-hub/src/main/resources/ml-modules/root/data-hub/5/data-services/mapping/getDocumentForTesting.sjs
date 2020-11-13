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

xdmp.securityAssert('http://marklogic.com/data-hub/privileges/read-mapping', 'execute');

const core = require('/data-hub/5/artifacts/core.sjs')
const ds = require("/data-hub/5/data-services/ds-utils.sjs");
const xmlToJson = require('./xmlToJsonForMapping.sjs');

var stepName, uri;

function _isSourceJson(format) {
  return format.toUpperCase() === 'JSON'
}

function _isValidQName(name) {
  try {
    fn.QName('', name);
    return true;
  } catch (e) {
    return false;
  }
}

function _isObject(value) {
  // Added key criteria as typeof(value) returned 'object' for some scalar values.
  return (value && typeof(value) === 'object' && Object.keys(value).length > 0) === true;
}

function _isAtomic(value) {
  return !_isObject(value);
}

function _isArray(value) {
  // False negatives from Array.isArray(value)
  return value && value.hasOwnProperty('0');
}

function _getXPath(leadingPath, nextPart, value, format, isArray) {
  // Account for invalid QNames, which is possible when the source format is JSON.
  let funcStart = '';
  let funcEnd = '';
  if (_isSourceJson(format) && !_isValidQName(nextPart)) {
    // Array of atomic values
    if (isArray && value.length > 0 && _isAtomic(value[0])) {
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

// Recursive function used to populate the sourceProperties portion/array of the return.
function _flatten(sourceData, sourceFormat, flatArray, flatArrayKey = '', level = 0) {
  let value, isObject, isArray, xpath;
  for (let key of Object.keys(sourceData)) {
    // sourceProperties is not to receive the #text properties.
    if (key === xmlToJson.PROP_NAME_FOR_TEXT) { continue }

    value = sourceData[key];
    isObject = _isObject(value);
    isArray = _isArray(value);
    xpath = _getXPath(flatArrayKey, key, value, sourceFormat, isArray);
    flatArray.push({
      name: key,
      xpath: xpath,
      struct: isObject,
      level: level
    })
    if (isObject && !isArray) {
      _flatten(value, sourceFormat, flatArray, `${flatArrayKey}/${key}`, level + 1);
    }
  }
}

const rtn = {
  data: null,
  namespaces: {},
  format: null,
  sourceProperties: []
}

// Offer the mapping step to define the doc's database.
const mappingStep = core.getArtifact('mapping', stepName);
let doc;
if (mappingStep.sourceDatabase) {
  doc = fn.head(xdmp.eval(`cts.doc('${uri}')`, null, {database: xdmp.database(mappingStep.sourceDatabase)}));
} else {
  doc = cts.doc(uri);
}

if (doc === null) {
  ds.throwNotFound(`Could not find a document with URI: ${uri}`);
}

// Populate return object.
rtn.format = doc.documentFormat;
if (_isSourceJson(rtn.format)) {
  rtn.data = (doc.root.hasOwnProperty('envelope') && doc.root.envelope.hasOwnProperty('instance')) ?
    doc.root.envelope.instance :
    doc.root;
} else {
  let xmlNode = fn.head(doc.root.xpath("/es:envelope/es:instance/node()", {"es":"http://marklogic.com/entity-services"}))
  if (xmlNode === null) {
    xmlNode = doc.root;
  }
  const transformResult = xmlToJson.transform(xmlNode);
  rtn.data = transformResult.data;
  rtn.namespaces = transformResult.namespaces;
}
_flatten(rtn.data, rtn.format, rtn.sourceProperties);

rtn;
