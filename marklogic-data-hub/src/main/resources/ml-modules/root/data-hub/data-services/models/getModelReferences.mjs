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

import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";


const entityName = external.entityName;
const propertyName = external.propertyName;
if (!entityName) {
  httpUtils.throwBadRequest("Must specify a name in order to get model references");
}

let entityModel = entityLib.findModelByEntityName(entityName);
if (!entityModel) {
  entityModel = entityLib.findDraftModelByEntityName(entityName);
  if (!entityModel) {
    httpUtils.throwNotFound(`Could not find entity model with name: ${entityName}`);
  }
}

const entityTypeId = entityLib.getEntityTypeId(entityModel, entityName);
const entityModelUris = [entityLib.getModelUri(entityName),entityLib.getDraftModelUri(entityName)];

let {stepNames, entityNames, entityNamesWithForeignKeyReferences} = external;

if (propertyName == null || propertyName == undefined) {
  stepNames = entityLib.findModelReferencesInSteps(entityName, entityTypeId);
  entityNames = entityLib.findModelReferencesInOtherModels(entityModelUris, entityTypeId);
  entityNamesWithForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(entityModel, propertyName);
}else{
  entityNamesWithForeignKeyReferences = entityLib.findForeignKeyReferencesInOtherModels(entityModel, propertyName);
  stepNames = entityLib.findModelAndPropertyReferencesInMappingRelatedSteps(entityName, entityTypeId, propertyName);
  stepNames = stepNames.concat(entityLib.findModelAndPropertyReferencesInMatchingMergingSteps(entityName, propertyName));
  stepNames = stepNames.concat(entityLib.findModelAndPropertyReferencesInMappingSteps(entityName, entityTypeId, propertyName));
  //the same property could be loaded on the property section and also in related mapping section
  stepNames = stepNames.filter((item,index)=>{
    return stepNames.indexOf(item) === index;
  })

}
const result = {stepNames, entityNames, entityNamesWithForeignKeyReferences};

result;
