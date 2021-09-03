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

declareUpdate();

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

var entityName;
if (!entityName) {
  httpUtils.throwBadRequest("Must specify a name in order to delete an entity model");
}

var entityModel = entityLib.findModelByEntityName(entityName);
if (!entityModel) {
  entityModel = entityLib.findDraftModelByEntityName(entityName);
  if (!entityModel) {
    httpUtils.throwNotFound(`Could not find entity model with name: ${entityName}`);
  }
}

const entityTypeId = entityLib.getEntityTypeId(entityModel, entityName);

const stepNames = entityLib.findModelReferencesInSteps(entityName, entityTypeId);
if (stepNames.length) {
  httpUtils.throwBadRequest(`Cannot delete the entity type '${entityName}' because it is referenced by the following step names: ${stepNames}`);
}

entityLib.deleteDraftModel(entityName);
