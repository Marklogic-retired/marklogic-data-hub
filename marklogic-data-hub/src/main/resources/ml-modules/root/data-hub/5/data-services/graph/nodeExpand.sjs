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

if (nodeToExpand == null && !(queryObj.isConcept && queryObj.objectConcept)) {
  httpUtils.throwBadRequest("Missing parentIRI. Required to expand a node.")
}

let result;
let totalEstimate = 0;
if(!isConcept) {
  if(queryObj.predicateFilter !== undefined && queryObj.predicateFilter.length > 0) {
    const predicateIRI = sem.iri(queryObj.predicateFilter);
    result = graphUtils.getEntityNodes(nodeToExpand, predicateIRI, queryObj.lastObjectIRI ? sem.iri(queryObj.lastObjectIRI): null, limit);
    totalEstimate = fn.count(cts.triples(null, predicateIRI, null, "=", [], cts.documentQuery(nodeToExpand)));
  } else {
    result = graphUtils.getEntityNodesByDocument(nodeToExpand, limit);
    const subjectIRIs = [];
    for (const triple of cts.triples(null, sem.curieExpand("rdfs:isDefinedBy"), null, "=", [], cts.documentQuery(nodeToExpand))) {
      subjectIRIs.push(sem.tripleSubject(triple));
    }
    totalEstimate = fn.count(cts.triples(subjectIRIs, graphUtils.getAllPredicates(), null, ["=","=","="])) + fn.count(cts.triples(null, graphUtils.getAllPredicates(), subjectIRIs, ["=","=","="]));
  }
} else {
  //is concept
  let objectConceptIRI = sem.iri(queryObj.objectConcept);
  result = graphUtils.getEntityNodesExpandingConcept(objectConceptIRI, limit);
}
let nodes = [];
let edges = [];
const edgesById = {};
const docUriToSubjectIri = {};

for (const item of result) {
  if (item.docURI) {
    const subjectIri = item.subjectIRI.toString();
    const subjectUri = item.docURI.toString();
    docUriToSubjectIri[subjectUri] = docUriToSubjectIri[subjectUri] || [];
    docUriToSubjectIri[subjectUri].push(subjectIri);
  }
  if (item.nodeCount == 1 && (item.firstDocURI || item.docRelated)) {
    const objectUri = item.docRelated ? item.docRelated : item.firstDocURI;
    const objectIri = item.firstObjectIRI.toString();
    docUriToSubjectIri[objectUri] = docUriToSubjectIri[objectUri] || [];
    docUriToSubjectIri[objectUri].push(objectIri);
  }
}

if (isConcept) {
  result.map(item => {
    const objectIRI = item.subjectIRI.toString();
    const docUriExists = fn.exists(item.docURI)
    let subjectArr = objectIRI.split("/");
    const objectId = subjectArr[subjectArr.length - 1];
    const group = objectIRI.substring(0, objectIRI.length - objectId.length - 1);
    let entityType =   subjectArr[subjectArr.length - 2];
    const nodeIsConcept = !docUriExists;
    let newLabel = docUriExists ? getCustomLabel(entityType,  item.docURI) : (fn.head(item.conceptLabel) || fn.head(item.predicateLabel));
    let nodeExpanded = {};
    nodeExpanded.id = docUriExists ? item.docURI : objectIRI;
    nodeExpanded.docURI = item.docURI;
    nodeExpanded.docIRI = objectIRI;
    if (fn.string(newLabel).length === 0) {
      nodeExpanded.label = objectId;
    }else{
      nodeExpanded.label = newLabel;
    }
    nodeExpanded.group = group;
    nodeExpanded.additionalProperties = null;
    nodeExpanded.isConcept = nodeIsConcept;
    nodeExpanded.hasRelationships = docUriExists ? docUriToSubjectIri[item.docURI].some(iri => graphUtils.relatedObjHasRelationships(iri)): graphUtils.relatedObjHasRelationships(objectIRI);
    nodeExpanded.count = 1;
    nodes.push(nodeExpanded);
    let edgeLabel = String(item.predicateIRI);
    edgeLabel = edgeLabel.substring(Math.max(edgeLabel.lastIndexOf("/"),edgeLabel.lastIndexOf("#")) + 1);
    let edge = {};
    const sortedIds = [nodeExpanded.id, queryObj.objectConcept].sort();
    edge.id = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
    if (!edgesById[edge.id]) {
      edgesById[edge.id] = edge;
      edge.predicate = group + "/" + item.predicateIRI;
      edge.label = edgeLabel;
      edge.from = sortedIds[0];
      edge.to = sortedIds[1];
      edges.push(edge);
    }
  });
  totalEstimate = nodes.length;
} else {
  let additionalNode = null, additionalEdge = null;
  result.map(item => {
    const objectIRI = item.firstObjectIRI.toString();
    const parentNodeId = nodeToExpand;
    let nodeDocUri = item.docRelated ? item.docRelated : item.firstDocURI;
    const docUriExists = fn.exists(nodeDocUri);
    let subjectArr = objectIRI.split("/");
    let objectId = subjectArr[subjectArr.length - 1];
    let nodeId = nodeDocUri && nodeDocUri.toString().length > 0 ? nodeDocUri : objectIRI;
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
    if(item.nodeCount === 1) {
      hasRelationships = docUriExists ? docUriToSubjectIri[nodeDocUri].some(iri => graphUtils.relatedObjHasRelationships(iri)): graphUtils.relatedObjHasRelationships(objectIRI);
    }

    let customLabel = docUriExists ? getCustomLabel(entityType, nodeDocUri): (fn.head(item.conceptLabel) || fn.head(item.predicateLabel));
    if (fn.string(customLabel).length !== 0) {
      nodeLabel = customLabel;
    }
    let resultPropertiesOnHover = nodeDocUri ? entityLib.getValuesPropertiesOnHover(nodeDocUri,entityType,hubCentralConfig): {};
    let nodeExpanded = {};
    nodeId = nodeId || objectIRI;
    nodeExpanded.id = nodeId || objectIRI;
    nodeExpanded.label = nodeLabel;
    nodeExpanded.docURI = nodeDocUri;
    nodeExpanded.docIRI = objectIRI;
    nodeExpanded.propertiesOnHover=resultPropertiesOnHover;
    nodeExpanded.group = group;
    nodeExpanded.additionalProperties = null;
    nodeExpanded.isConcept = !docUriExists;
    nodeExpanded.hasRelationships = hasRelationships;
    nodeExpanded.count = nodeCount;
    nodes.push(nodeExpanded);

    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];

    let edge = {};
    const sortedIds = [nodeId, parentNodeId].sort();
    const fromId =  sortedIds[0];
    const toId = sortedIds[1];
    edge.id = "edge-" + fromId + "-" + item.predicateIRI + "-" + toId;
    if (!edgesById[edge.id]) {
      edgesById[edge.id] = edge;
      edge.predicate = item.predicateIRI;
      edge.label = edgeLabel;
      edge.from = fromId;
      edge.to = toId;
      edges.push(edge);
    }
    if(limit < totalEstimate && !additionalNode) {
      const groupParts = group.split("/");
      const entityIdLabel = groupParts[groupParts.length - 1];
      const additionalId = parentNodeId + "-" + item.predicateIRI + "-" + entityIdLabel;
      additionalNode = {};
      //creating additional node
      additionalNode.id = additionalId;
      additionalNode.docURI = null;
      additionalNode.docIRI = null;
      additionalNode.label = entityIdLabel;
      additionalNode.group = group;
      additionalNode.additionalProperties = null;
      additionalNode.isConcept = false;
      additionalNode.hasRelationships = false;
      additionalNode.count = totalEstimate - limit;
      additionalNode.predicateIri = item.predicateIRI;
      //creating additional edge
      additionalEdge = {};
      additionalEdge.id = "edge-" + parentNodeId + "-" + item.predicateIRI + "-" + group;
      additionalEdge.predicate = item.predicateIRI;
      additionalEdge.label = edgeLabel;
      additionalEdge.from = parentNodeId;
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
