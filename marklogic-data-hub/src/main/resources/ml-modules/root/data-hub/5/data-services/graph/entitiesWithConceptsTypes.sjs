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


const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const sem = require("/MarkLogic/semantics.xqy");
const graphUtils = require("/data-hub/5/impl/graph-utils.sjs");



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
  const objectIRI = item.subjectIRI.toString();
  let subjectArr = objectIRI.split("/");
  const objectId = subjectArr[subjectArr.length - 1];
  const entityType = objectIRI.substring(0, objectIRI.length - objectId.length - 1);

  if(!hashmapEntityType.has(entityType)){
    let conceptList = [];
    conceptList.push(item.objectConcept.toString());
    hashmapEntityType.set(entityType,conceptList);
  }else{
    //in case that different instance of the same type, has the same Concept type
    if(!hashmapEntityType.get(entityType).includes(item.objectConcept.toString())){
      hashmapEntityType.set(entityType,hashmapEntityType.get(entityType).concat(item.objectConcept));
    }
  }
})

hashmapEntityType.forEach (function(relatedConcepts, entityType) {
  let entityNode = {};
  entityNode.entityType = entityType;
  entityNode.relatedConcepts = relatedConcepts;
  nodes.push(entityNode);
})

const response = {
  'entitites': nodes
};

response;
