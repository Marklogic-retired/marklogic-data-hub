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
import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const input = fn.head(xdmp.fromJSON(external.input));

const name = input.name;
const description = input.description;
const namespace = input.namespace ? input.namespace : null;
const namespacePrefix = input.namespacePrefix ? input.namespacePrefix : null;
const version = input.version ? input.version : null;
const hubCentralConfig = input.hubCentral ? input.hubCentral : null;

if (name == null) {
  httpUtils.throwBadRequest("The model must have an info object with a title property");
}

const entityModel = entityLib.findDraftModelByEntityName(name)
if (entityModel) {
  if(!entityModel.info.draftDeleted) {
    httpUtils.throwBadRequest(`An entity type is already using the name ${name}. An entity type cannot use the same name as an existing entity type.`);
  }
} else if (fn.docAvailable(entityLib.getModelUri(name))) {
  httpUtils.throwBadRequest(`An entity type is already using the name ${name}. An entity type cannot use the same name as an existing entity type.`);
}

const model = {
  info: {
    title: name
  },
  definitions: {}
};

model.definitions[name] = {
  properties: {}
};

if(namespace || namespacePrefix){
  if(!namespace){
    httpUtils.throwBadRequest(`You cannot enter a prefix without specifying a namespace URI `);
  }
  if(!namespacePrefix){
    httpUtils.throwBadRequest(`Since you entered a namespace, you must specify a prefix.`);
  }
  model.definitions[name].namespace = namespace;
  model.definitions[name].namespacePrefix = namespacePrefix;
}

if (input.description) {
  model.definitions[name].description = description;
}

// commenting out for entity version rollback DHFPROD-9943
// if (input.version) {
//   model.info.version = version;
// }

if(hubCentralConfig){
  model.hubCentral = hubCentralConfig;
}

try{
  entityLib.writeDraftModel(name, model);
}
catch (e){
  httpUtils.throwBadRequest(hubUtils.getErrorMessage(e));
}

model;
