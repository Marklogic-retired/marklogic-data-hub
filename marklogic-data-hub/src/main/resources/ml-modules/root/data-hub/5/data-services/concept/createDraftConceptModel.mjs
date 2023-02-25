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
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import conceptLib from "/data-hub/5/impl/concept-lib.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const input = fn.head(xdmp.fromJSON(external.input));

const name = input.name;
const description = input.description;
const hubCentralConfig = input.hubCentral ? input.hubCentral : null;

if (name == null) {
  httpUtils.throwBadRequest("The model must have an info object with a name property");
}

const conceptModel = conceptLib.findDraftModelByConceptName(name)
if (conceptModel) {
  if(!conceptModel.info.draftDeleted) {
    httpUtils.throwBadRequest(`Concept class is already using the name ${name}. Concept class cannot use the same name as an existing concept class.`);
  }
} else if (fn.docAvailable(conceptLib.getConceptModelUri(name))) {
  httpUtils.throwBadRequest(`Concept class is already using the name ${name}. Concept class cannot use the same name as an existing concept class.`);
}

const model = {
  info: {
    name: name
  },

};


if (input.description) {
  model.info.description = description;
}

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
