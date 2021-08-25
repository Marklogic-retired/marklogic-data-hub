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
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

var name;
var input = fn.head(xdmp.fromJSON(input));

const description = input.description ? input.description : "";
const namespace = input.namespace;
const namespacePrefix = input.namespacePrefix;
const hubCentralConfig = input.hubCentral;

const uri = entityLib.getModelUri(name);
const draftUri = entityLib.getDraftModelUri(name);
const draftExists = fn.docAvailable(draftUri);
if (!(fn.docAvailable(uri) || draftExists)) {
  httpUtils.throwBadRequest("Could not find model with name: " + name);
}

const model = (draftExists) ? cts.doc(draftUri).toObject() : cts.doc(uri).toObject();

if (!model.definitions[name]) {
  httpUtils.throwBadRequest("Could not find model with an entity type with name: " + name);
}

model.definitions[name].description = description;

if(namespace || namespacePrefix){
  if(!namespace){
    httpUtils.throwBadRequest(`You cannot enter a prefix without specifying a namespace URI.`);
  }
  if(!namespacePrefix){
    httpUtils.throwBadRequest(`Since you entered a namespace, you must specify a prefix.`);
  }
}
/*
If payload doesn't contain namespace and namespacePrefix, entity model didn't have them in the first place or
user wants to remove the values he had set earlier
 */

if(!namespace){
  delete model.definitions[name].namespace;
  delete model.definitions[name].namespacePrefix;
}
else{
  model.definitions[name].namespace = namespace;
  model.definitions[name].namespacePrefix = namespacePrefix;
}

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
