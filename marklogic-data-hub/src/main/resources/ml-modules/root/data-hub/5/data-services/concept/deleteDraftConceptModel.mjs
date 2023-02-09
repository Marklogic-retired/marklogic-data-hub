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

import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import conceptLib from "/data-hub/5/impl/concept-lib.mjs";

const conceptName = external.conceptName;
if (!conceptName) {
  httpUtils.throwBadRequest("Must specify a name in order to delete an concept model");
}

let conceptModel = conceptLib.findModelByConceptName(conceptName);
if (!conceptModel) {
  conceptModel = conceptLib.findDraftModelByConceptName(conceptName);
  if (!conceptModel) {
    httpUtils.throwNotFound(`Could not find concept model with name: ${conceptName}`);
  }
}

/*for the moment we don't want this validation, because when we delete a concept, we delete all the references from entities,
 but it is working, I keep it comment in case we need it in the future
const entitiesNames = conceptLib.findConceptModelReferencesInEntities(conceptName);
if (entitiesNames.length) {
  httpUtils.throwBadRequest(`Cannot delete the concept class '${conceptName}' because it is referenced by the following entity names: ${entitiesNames}`);
}*/

conceptLib.deleteDraftConceptModel(conceptName);
