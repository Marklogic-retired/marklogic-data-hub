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

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const sem = require("/MarkLogic/semantics.xqy");
const graphUtils = require("/data-hub/5/impl/graph-utils.sjs");

function handleBySubjectIRI(entityName, subjectIRI) {
  let relatedTypeIRIs = [];
  fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
    model = model.toObject();
    const modelName = model.info.title;

    const predicateList = entityLib.getPredicatesByModel(model);
    if(predicateList.length >= 1){
      hashmapPredicate.set(modelName, predicateList);
    }

    if (modelName !== entityName) {
      const entityNameIri = entityLib.getEntityTypeId(model, modelName);
      relatedTypeIRIs.push(sem.iri(entityNameIri));
    }
  });
  return graphUtils.getEntityNodesBySubject(sem.iri(subjectIRI), relatedTypeIRIs, limit);
}

function handleByPredicate(entityName, predicateIRI) {
  let relatedTypeIRIs = [];
  const entityTypeIRI = sem.iri(nodeToExpand.substring(0, nodeToExpand.length - entityName.length - 1));
  fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
    model = model.toObject();
    const modelName = model.info.title;

    if(model.definitions[entityName] !== undefined && model.definitions[entityName].toString().length > 0) {
      const predicateList = entityLib.getPredicatesByModel(model);
      if(predicateList.length >= 1){
        hashmapPredicate.set(modelName, predicateList);
      }

      if (modelName == entityName) {
        const entityNameIri = entityLib.getEntityTypeId(model, modelName);
        relatedTypeIRIs.push(sem.iri(entityNameIri));
      }
    }
  });
  return graphUtils.getEntityNodes(entityTypeIRI, predicateIRI, relatedTypeIRIs, limit);
}
var nodeInfo;
var limit;

if(nodeInfo == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}

limit = limit || 100;
let queryObj = JSON.parse(nodeInfo);
const nodeToExpand = queryObj.parentIRI;

let isByEntityType = false;
var hashmapPredicate = new Map();

if (nodeToExpand == null) {
  httpUtils.throwBadRequest("Missing parentIRI. Required to expand a node.")
}

let entityIRIArr = nodeToExpand.split("/");
let entityId = entityIRIArr[entityIRIArr.length - 1];
const entityIdSplit = entityId.split("-");
let result;
let totalEstimate = 0;

if(entityIdSplit.length == 1) {
  //has relationship option
  const entityType = entityIRIArr[entityIRIArr.length - 2];
  result = handleBySubjectIRI(entityType, nodeToExpand);
  totalEstimate = fn.count(cts.triples(sem.iri(nodeToExpand), hashmapPredicate.get(entityType), null));
} else if(entityIdSplit.length == 2) {
  //by predicate option
  let entityTypeName = entityIdSplit[1];
  let predicateIRI = null;
  if(queryObj.predicateFilter !== undefined && queryObj.predicateFilter.length > 0) {
    predicateIRI = sem.iri(queryObj.predicateFilter);
  }
  isByEntityType = true;
  const rootNode = sem.iri(nodeToExpand.substring(0, nodeToExpand.length - entityTypeName.length - 1));
  totalEstimate = fn.count(cts.triples(rootNode, predicateIRI, null));
  //as the total is only one more than limit, we dont create an a additional node with remaining count, we show a real node DHFPROD-8377
  let limitNumberPlusOne= Number(limit);
  limitNumberPlusOne ++;
  if(limitNumberPlusOne === totalEstimate){
    limit = limitNumberPlusOne;
  }
  result = handleByPredicate(entityTypeName, predicateIRI);
}

let nodes = [];
let edges = [];
let addedAdditionalNode = false;
let additionalEdge = {};
let additionalNode = {};

if (isByEntityType) {
  result.map(item => {
    const objectIRI = item.objectIRI.toString();
    let subjectArr = objectIRI.split("/");
    const objectId = subjectArr[subjectArr.length - 1];

    const group = objectIRI.substring(0, objectIRI.length - objectId.length - 1);
    let hasRelationships = graphUtils.relatedObjHasRelationships(objectIRI, hashmapPredicate);

    let nodeExpanded = {};
    nodeExpanded.id = objectIRI;
    nodeExpanded.docURI = item.docURI;
    nodeExpanded.label = objectId;
    nodeExpanded.group = group;
    nodeExpanded.additionalProperties = null;
    nodeExpanded.isConcept = false;
    nodeExpanded.hasRelationships = hasRelationships;
    nodeExpanded.count = 1;
    nodes.push(nodeExpanded);
    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];

    let edge = {};
    edge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + objectIRI;
    edge.predicate = item.predicateIRI;
    edge.label = edgeLabel;
    edge.from = item.subjectIRI;
    edge.to = objectIRI;
    edges.push(edge);

    if(limit < totalEstimate && !addedAdditionalNode){
      //creating additional node
      additionalNode.id = nodeToExpand;
      additionalNode.docURI = null;
      additionalNode.label = entityIdSplit[1];
      additionalNode.group = group;
      additionalNode.additionalProperties = null;
      additionalNode.isConcept = false;
      additionalNode.hasRelationships = false;
      additionalNode.count = totalEstimate - limit;
      //creating additional edge
      additionalEdge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + nodeToExpand;
      additionalEdge.predicate = item.predicateIRI;
      additionalEdge.label = edgeLabel;
      additionalEdge.from = item.subjectIRI;
      additionalEdge.to = nodeToExpand;
      addedAdditionalNode = true;
    }
  })
  //this is an additional node with remaining count
  if(addedAdditionalNode){
    //adding the node that we loaded before
    nodes.push(additionalNode);
    //adding the edge that we loaded before
    edges.push(additionalEdge);
  }

} else {
  result.map(item => {
    const objectIRI = item.firstObjectIRI.toString();
    let subjectArr = objectIRI.split("/");
    let objectId = subjectArr[subjectArr.length - 1];
    let nodeId = objectIRI;
    let nodeLabel = objectId;
    let nodeDocUri = item.firstDocURI;
    let nodeCount = 1;

    if(item.nodeCount && item.nodeCount > 1) {
      nodeLabel = subjectArr[subjectArr.length - 2];
      nodeId = nodeToExpand + "-" + subjectArr[subjectArr.length - 2];
      nodeCount = item.nodeCount;
      nodeDocUri = null;
    }

    const group = objectIRI.substring(0, objectIRI.length - objectId.length - 1);

    let hasRelationships = false;
    if(item.nodeCount) {
      hasRelationships = graphUtils.relatedObjHasRelationships(objectIRI, hashmapPredicate);
    }
    let nodeExpanded = {};
    nodeExpanded.id = nodeId;
    nodeExpanded.docURI = nodeDocUri;
    nodeExpanded.label = nodeLabel;
    nodeExpanded.group = group;
    nodeExpanded.additionalProperties = null;
    nodeExpanded.isConcept = false;
    nodeExpanded.hasRelationships = hasRelationships;
    nodeExpanded.count = nodeCount;
    nodes.push(nodeExpanded);

    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];

    let edge = {};
    edge.id = "edge-" + nodeToExpand + "-" + item.predicateIRI + "-" + objectIRI;
    edge.predicate = item.predicateIRI;
    edge.label = edgeLabel;
    edge.from = nodeToExpand;
    edge.to = nodeId;
    edges.push(edge);
  });
}


const response = {
  'total': totalEstimate,
  'limit': limit,
  'nodes': nodes,
  'edges': edges
};

response;
