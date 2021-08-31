/**
 Copyright (c) 2021 MarkLogic Corporation

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

const ext = require("/data-hub/public/extensions/entity/build-property-path-reference.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubEs = require('/data-hub/5/impl/hub-es.sjs');

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

const entityTypeId = queryObj.entityTypeId;
const propertyPath = queryObj.propertyPath;
let referenceType = queryObj.referenceType;

if(!referenceType || referenceType === "") {
  referenceType = hubEs.getPropertyReferenceType(entityTypeId, propertyPath);
}

const query = referenceType === 'element' ?
  cts.elementReference(propertyPath) :
  ext.buildPropertyPathReference(entityTypeId, propertyPath);

const rangeValues = {
  min : cts.min(query),
  max : cts.max(query)
};

rangeValues
