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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-entity-model", "execute");

import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import conceptLib from "/data-hub/5/impl/concept-lib.mjs";

const ext = require("/data-hub/extensions/entity/build-entity-query.xqy");

const includeDrafts = external.includeDrafts;

function buildEntityResponse(modelObject) {
  const entityName = modelObject.info.title;
  const jobData = entityLib.getLatestJobData(entityName);
  const response = {
    entityName: entityName,
    entityTypeId: entityLib.getEntityTypeId(modelObject, entityName),
    entityInstanceCount: cts.estimate(ext.buildEntityQuery(entityName)),
    model: modelObject
  };
  return Object.assign(response, jobData);

}

let modelResponseArr = [];
let conceptResponseArr = [];
// Get draft models if requested
if (includeDrafts) {
  modelResponseArr = fn.collection(entityLib.getDraftModelCollection()).toArray().map(model => {
    model = model.toObject();
    return buildEntityResponse(model);
  });

  conceptResponseArr = fn.collection(conceptLib.getDraftConceptCollection()).toArray().map(concept => {
    concept = concept.toObject();
    return buildConceptResponse(concept);
  });
}

// Add in published models that were not added as part of drafts
fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
  model = model.toObject();
  const entityName = model.info.title;
  const existingDraftIndex = modelResponseArr.findIndex((entityResp) => {
    return entityName === entityResp.entityName;
  });
  if (existingDraftIndex < 0) {
    modelResponseArr.push(buildEntityResponse(model));
  }
});

// Add in published concepts that were not added as part of drafts
fn.collection(conceptLib.getConceptCollection()).toArray().forEach(concept => {
  concept = concept.toObject();
  const conceptName = concept.info.name;
  const existingDraftConceptIndex = conceptResponseArr.findIndex((conceptResp) => {
    return conceptName === conceptResp.conceptName;
  });
  if (existingDraftConceptIndex < 0) {
    conceptResponseArr.push(buildConceptResponse(concept));
  }

});

modelResponseArr.sort(function(modelA, modelB) {
  let nameA = getEntityOrConceptName(modelA);
  let nameB = getEntityOrConceptName(modelB);
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
});

modelResponseArr = modelResponseArr.concat(conceptResponseArr)

function buildConceptResponse(modelObject) {
  const conceptName = modelObject.info.name;
  const response = {
    conceptName: conceptName,
    model: modelObject,
  };
  return Object.assign(response);

}

function getEntityOrConceptName(modelObject){
  if (modelObject.hasOwnProperty("entityName")) {
    return modelObject.entityName;
  }else{
    return modelObject.conceptName;
  }
}
