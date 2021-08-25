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
'use strict';

declareUpdate();

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

var input = JSON.parse(input);

if (!input || !Array.isArray(input)) {
  httpUtils.throwBadRequest("Valid array input required.");
}

input.forEach(entry => {
  const entityName = entry["entityName"];
  if (!entityName) {
    httpUtils.throwBadRequest("Must specify an entity name.");
  }

  const modelDefinition = entry["modelDefinition"];
  if (!modelDefinition) {
    httpUtils.throwBadRequest(`Must specify a model definition for entity: ${entityName}`);
  }

  const hubCentralConfig = entry["hubCentral"];

  const uri = entityLib.getModelUri(entityName);
  const draftUri = entityLib.getDraftModelUri(entityName);
  if (!(fn.docAvailable(uri) || fn.docAvailable(draftUri))) {
    httpUtils.throwBadRequest("Could not find model with name: " + entityName);
  }

  const model = (cts.doc(draftUri) || cts.doc(uri)).toObject();
  model.definitions = modelDefinition;
  if(hubCentralConfig){
    model.hubCentral = hubCentralConfig;
  }
  entityLib.writeDraftModel(entityName, model);
});
