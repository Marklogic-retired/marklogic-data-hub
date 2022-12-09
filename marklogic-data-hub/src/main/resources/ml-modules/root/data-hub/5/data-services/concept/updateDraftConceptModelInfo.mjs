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

import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import conceptLib from "/data-hub/5/impl/concept-lib.mjs";

const name = external.name;
const input = fn.head(xdmp.fromJSON(external.input));
const description = input.description ? input.description : "";
const hubCentralConfig = input.hubCentral;
const uri = conceptLib.getConceptModelUri(name);
const draftUri = conceptLib.getDraftConceptModelUri(name);
const draftExists = fn.docAvailable(draftUri);
if (!(fn.docAvailable(uri) || draftExists)) {
  httpUtils.throwBadRequest("Could not find model with name: " + name);
}

const model = (draftExists) ? cts.doc(draftUri).toObject() : cts.doc(uri).toObject();

if (!model.info.name) {
  httpUtils.throwBadRequest("Could not find model with a concept class with name: " + name);
}

model.info.description = description;

if(hubCentralConfig){
  model.hubCentral = hubCentralConfig;
}

try{
  conceptLib.writeDraftConceptModel(name, model);
}
catch (e){
  httpUtils.throwBadRequest(hubUtils.getErrorMessage(e));
}

model;
