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
const hubCentralConfig = cts.doc("/config/hubCentral.json")

var nodeInfo;
var limit;

function handleByConceptObjectAndParentEntity(parentEntityName, objectConceptIRI) {
  let EntityTypeIRIsWithoutParent = [];
  fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
    model = model.toObject();
    const modelName = model.info.title;
    if (modelName != parentEntityName) {
      const entityNameIri = entityLib.getEntityTypeId(model, modelName);
      EntityTypeIRIsWithoutParent.push(sem.iri(entityNameIri));
    }
  });
  return graphUtils.getEntityNodesExpandingConcept(EntityTypeIRIsWithoutParent, objectConceptIRI, limit);
}

if(nodeInfo == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}

limit = limit || 100;
let queryObj = JSON.parse(nodeInfo);
const nodeToExpand = queryObj.parentIRI;

let isConcept = false;
if(queryObj.isConcept != null && queryObj.isConcept === true){
  isConcept = true;
}
let hashmapPredicate = new Map();

if (nodeToExpand == null) {
  httpUtils.throwBadRequest("Missing parentIRI. Required to expand a node.")
}

let result;
let totalEstimate = 0;
if(!isConcept) {
  if(queryObj.predicateFilter !== undefined && queryObj.predicateFilter.length > 0) {
    const predicateIRI = sem.iri(queryObj.predicateFilter);
    result = graphUtils.getEntityNodes(nodeToExpand, predicateIRI, limit);
    totalEstimate = fn.count(cts.triples(null, predicateIRI, null, "=", [], cts.documentQuery(nodeToExpand)));
  } else {
    result = graphUtils.getEntityNodesByDocument(nodeToExpand, limit);
    const subjectIRIs = [];
    for (const triple of cts.triples(null, sem.curieExpand("rdfs:isDefinedBy"), null, "=", [], cts.documentQuery(nodeToExpand))) {
      subjectIRIs.push(sem.tripleSubject(triple));
    }
    totalEstimate = fn.count(cts.triples(subjectIRIs, null, null, ["=","=","="])) - fn.count(cts.triples(subjectIRIs, [sem.curieExpand("rdfs:isDefinedBy"),sem.curieExpand("rdf:type")], null, ["=","=","="]));
  }
} else {
   //is concept
  const entityIRIArr = nodeToExpand.split("/");
  const parentEntityType = entityIRIArr[entityIRIArr.length - 2];
  let objectConcept = sem.iri(queryObj.objectConcept);
  result = handleByConceptObjectAndParentEntity(parentEntityType,objectConcept);
}
let nodes = [];
let edges = [];

if (isConcept) {
  result.map(item => {
    const objectIRI = item.subjectIRI.toString();
    let subjectArr = objectIRI.split("/");
    const objectId = subjectArr[subjectArr.length - 1];
    const group = objectIRI.substring(0, objectIRI.length - objectId.length - 1);
    let entityType =   subjectArr[subjectArr.length - 2];
    let newLabel = getCustomLabel(entityType,  item.docURI);
    let nodeExpanded = {};
    nodeExpanded.id = objectIRI + "_" + item.docURI;
    nodeExpanded.docURI = item.docURI;
    if (newLabel.toString().length === 0) {
      nodeExpanded.label = objectId;
    }else{
      nodeExpanded.label = newLabel;
    }
    nodeExpanded.group = group;
    nodeExpanded.additionalProperties = null;
    nodeExpanded.isConcept = false;
    nodeExpanded.hasRelationships = false;
    nodeExpanded.count = 1;
    nodes.push(nodeExpanded);
    let edgeLabel = item.predicateIRI;

    let edge = {};
    edge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + item.objectConcept;
    edge.predicate = group+"/"+ item.predicateIRI;
    edge.label = edgeLabel;
    edge.from = item.subjectIRI;
    edge.to = item.objectConcept;
    edges.push(edge);
  });
  totalEstimate = nodes.length;
} else {
  let additionalNode = null, additionalEdge = null;
  result.map(item => {
    const objectIRI = item.firstObjectIRI.toString();
    const fromId = item.subjectIRI + "_" + nodeToExpand;
    let nodeDocUri = item.docRelated ? item.docRelated : item.firstDocURI;
    let subjectArr = objectIRI.split("/");
    let objectId = subjectArr[subjectArr.length - 1];
    let nodeId = objectIRI + "_" + nodeDocUri;
    let nodeLabel = objectId;
    let nodeCount = 1;
    let entityType =   subjectArr[subjectArr.length - 2];
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

    let customLabel = nodeDocUri ? getCustomLabel(entityType, nodeDocUri): "";
    if (customLabel.toString().length !== 0) {
      nodeLabel = customLabel;
    }
    let resultPropertiesOnHover = nodeDocUri ? entityLib.getValuesPropertiesOnHover(nodeDocUri,entityType,hubCentralConfig): {};
    let nodeExpanded = {};
    nodeExpanded.id = nodeId;
    nodeExpanded.label = nodeLabel;
    nodeExpanded.docURI = nodeDocUri;
    nodeExpanded.propertiesOnHover=resultPropertiesOnHover;
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
    edge.from = fromId;
    edge.to = nodeId;
    edges.push(edge);

    if(limit < totalEstimate && !additionalNode) {
      const groupParts = group.split("/");
      const entityIdLabel = groupParts[groupParts.length - 1];
      const additionalId = fromId + "-" + entityIdLabel;
      additionalNode = {};
      //creating additional node
      additionalNode.id = additionalId;
      additionalNode.docURI = null;
      additionalNode.label = entityIdLabel;
      additionalNode.group = group;
      additionalNode.additionalProperties = null;
      additionalNode.isConcept = false;
      additionalNode.hasRelationships = false;
      additionalNode.count = totalEstimate - limit;
      //creating additional edge
      additionalEdge = {};
      additionalEdge.id = "edge-" + fromId + "-" + item.predicateIRI + "-" + group;
      additionalEdge.predicate = item.predicateIRI;
      additionalEdge.label = edgeLabel;
      additionalEdge.from = fromId;
      additionalEdge.to = additionalId;
    }
  });
  //this is an additional node with remaining count
  if(additionalNode){
    //adding the node that we loaded before
    nodes.push(additionalNode);
    //adding the edge that we loaded before
    edges.push(additionalEdge);
  }
}

function getCustomLabel(entityType, docUri) {
  let customLabel = "";
  let configurationLabel = entityLib.getLabelFromHubConfigByEntityType(entityType, hubCentralConfig);
  if (configurationLabel.toString().length > 0) {
    //getting the value of the configuration property
    customLabel = entityLib.getValueFromProperty(configurationLabel, docUri, entityType);
  }
  return customLabel;
}

const response = {
  'total': totalEstimate,
  'limit': limit,
  'nodes': nodes,
  'edges': edges
};

response;
