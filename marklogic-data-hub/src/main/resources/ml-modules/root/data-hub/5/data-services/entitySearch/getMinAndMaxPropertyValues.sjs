/**
 Copyright (c) 2020 MarkLogic Corporation

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
'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-entity-model", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const lib = require('/data-hub/5/impl/hub-es.sjs');

var facetRangeSearchQuery;
if(facetRangeSearchQuery == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}
let queryObj = JSON.parse(facetRangeSearchQuery);

if(queryObj.entityTypeId == null) {
  httpUtils.throwBadRequest("Could not get min and max values, search query is missing entityTypeId property");
}

if(queryObj.propertyPath == null) {
  httpUtils.throwBadRequest("Could not get min and max values, search query is missing propertyPath property");
}

if(queryObj.referenceType == null) {
  httpUtils.throwBadRequest("Could not get min and max values, search query is missing referenceType property");
}

let entityTypeId = queryObj.entityTypeId;
let propertyPath = queryObj.propertyPath;
let referenceType = queryObj.referenceType;
var query;

let rangeValues = {
  "min": null,
  "max": null
};

if(!referenceType || referenceType === "") {
  referenceType = lib.getPropertyReferenceType(entityTypeId, propertyPath);
}

if(referenceType === 'element') {
  query = cts.elementReference(propertyPath);
} else {
  const result = lib.buildPathReferenceParts(entityTypeId, propertyPath);
  query = cts.pathReference(result.pathExpression, null, result.namespaces);
}

rangeValues.min = cts.min(query);
rangeValues.max = cts.max(query);

rangeValues;
