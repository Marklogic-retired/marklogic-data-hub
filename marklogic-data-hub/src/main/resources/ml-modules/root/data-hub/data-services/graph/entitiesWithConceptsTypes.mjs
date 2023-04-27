/**
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

// No privilege required: No special privilege is needed for this endpoint


import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import graphUtils from "/data-hub/5/impl/graph-utils.mjs";

let entityTypeIRIs = [];
let predicateConceptList = [];
let hashmapEntityType = new Map();
let result;



fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
  model = model.toObject();
  const entityName = model.info.title;
  const entityNameIri = entityLib.getEntityTypeId(model, entityName);
  entityTypeIRIs.push(sem.iri(entityNameIri));
  predicateConceptList = predicateConceptList.concat(entityLib.getConceptPredicatesByModel(model));

});
result = graphUtils.getEntityWithConcepts(entityTypeIRIs, predicateConceptList);
let nodes = [];


result.map(item => {
  const entityType = item.entityTypeIRI.toString();
  const conceptIRI = item.objectIRI.toString();
  const relatedEntitiesCountDataSet = graphUtils.getRelatedEntityInstancesCount([sem.iri(conceptIRI), conceptIRI]);
  const finalObj = relatedEntitiesCountDataSet.find(el => el.entityTypeIRI.toString() === entityType);
  if (finalObj) {
    const conceptInfo = {
      entityType,
      conceptIRI: conceptIRI,
      count: finalObj.total,
      conceptClass: fn.string(item.conceptClassName)
    };

    if (!hashmapEntityType.has(entityType)) {
      let conceptList = [];
      conceptList.push(conceptInfo);
      hashmapEntityType.set(entityType, conceptList);
    } else {
      let conceptInfoObject = hashmapEntityType.get(entityType).find((elem) => elem.conceptIRI.toString() === conceptIRI) || {};
      //in case that different instance of the same type, has the same Concept type
      if (!Object.keys(conceptInfoObject).length) {
        hashmapEntityType.set(entityType, hashmapEntityType.get(entityType).concat(conceptInfo));
      }
    }
  }
})

const supportsGraphConceptsSearch = true;

hashmapEntityType.forEach (function(relatedConcepts, entityType) {
  let entityNode = {};
  entityNode.entityType = entityType;
  entityNode.relatedConcepts = relatedConcepts;
  nodes.push(entityNode);
})

const response = {
  supportsGraphConceptsSearch,
  'entitites': nodes
};

response;
