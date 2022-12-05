/*
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

const conceptLib = require("/data-hub/5/impl/concept-lib.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

const conceptName = external.conceptName;
if (!conceptName) {
  httpUtils.throwBadRequest("Must specify a name in order to get model references");
}

var conceptModel = conceptLib.findModelByConceptName(conceptName);
if (!conceptModel) {
  conceptModel = conceptLib.findDraftModelByConceptName(conceptName);
  if (!conceptModel) {
    httpUtils.throwNotFound(`Could not find concept class with name: ${conceptName}`);
  }
}

const entityNamesWithRelatedConcept = conceptLib.findConceptReferencesInEntities(conceptName);
const result = {entityNamesWithRelatedConcept};

result;
