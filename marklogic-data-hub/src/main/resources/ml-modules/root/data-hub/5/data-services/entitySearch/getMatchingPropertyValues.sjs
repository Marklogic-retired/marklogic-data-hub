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

var facetValuesSearchQuery;
if(facetValuesSearchQuery == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}
let queryObj = JSON.parse(facetValuesSearchQuery);

if(queryObj.entityTypeId == null) {
  httpUtils.throwBadRequest("Could not get matching values, search query is missing entityTypeId property");
}

if(queryObj.propertyPath == null) {
  httpUtils.throwBadRequest("Could not get matching values, search query is missing propertyPath property");
}

if(queryObj.referenceType == null) {
  httpUtils.throwBadRequest("Could not get matching values, search query is missing referenceType property");
}

if(queryObj.limit == null) {
  queryObj.limit = 10;
}

if(queryObj.pattern == null) {
  queryObj.pattern = "";
}

let entityTypeId = queryObj.entityTypeId;
let propertyPath = queryObj.propertyPath;
let referenceType = queryObj.referenceType;
let limit = queryObj.limit;
let pattern = queryObj.pattern;
var query;

if (referenceType === "field") {
  if (propertyPath === "createdByStep") {
    propertyPath = "datahubCreatedByStep";
  }

  if (propertyPath === "createdInFlowRange") {
    propertyPath = "datahubCreatedInFlow";
  }
}

if(referenceType === 'element') {
  query = cts.elementReference(propertyPath);
} else if(referenceType === 'field') {
  query = cts.fieldReference(propertyPath);
} else if(referenceType === 'collection') {
  query = cts.collectionReference();
} else {
  const result = lib.buildPathReferenceParts(entityTypeId, propertyPath);
  query = cts.pathReference(result.pathExpression, null, result.namespaces);
}

var facetValues = cts.valueMatch(query, pattern + "*",
    ["item-order", "ascending", "limit=" + limit]).toArray().map(String);

if (facetValues.length < limit) {
  var moreFacetValues = cts.valueMatch(query, "?*" + pattern + "*",
      ["item-order", "ascending", "limit=" + limit]).toArray().map(String);
  facetValues = Array.from(
      [...new Set([...facetValues, ...moreFacetValues])]).slice(0, limit);
}

facetValues;
