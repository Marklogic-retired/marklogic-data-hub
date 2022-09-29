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
const sem = require("/MarkLogic/semantics.xqy");
const graphUtils = require("/data-hub/5/impl/graph-utils.sjs");

var nodeInfo;
var limit;

if(nodeInfo == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}

const entityTypeIds = graphUtils.getAllEntityIds();
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
const hasPredicateFilter = queryObj.predicateFilter !== undefined && queryObj.predicateFilter.length > 0;

let result;
let totalEstimate = 0;
if(!isConcept) {
  if(hasPredicateFilter) {
    const predicateIRI = sem.iri(queryObj.predicateFilter);
    totalEstimate = fn.count(cts.triples(null, predicateIRI, null, "=", [], cts.documentQuery(nodeToExpand)));
    // We don't want a group node of 1
    if ((totalEstimate - limit) === 1) {
      limit = totalEstimate;
    }
    result = graphUtils.getEntityNodes(nodeToExpand, predicateIRI, queryObj.lastObjectIRI ? sem.iri(queryObj.lastObjectIRI): null, limit);
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

let {nodes, edges} = graphUtils.graphResultsToNodesAndEdges(result, entityTypeIds, false, !isConcept);
if (isConcept) {
  nodes = nodes.filter(node => node.id !== queryObj.objectConcept);
  totalEstimate = nodes.length;
} else if (hasPredicateFilter && limit < totalEstimate) {
  const objectIRI = nodes[0].docIRI;
  const objectIRIArr = objectIRI.split("/");
  const entityType = objectIRIArr[objectIRIArr.length - 2];
  const objectId = nodeToExpand + "-" + queryObj.predicateFilter + "-" + entityType;
  const objectNode = {};
  const nodeCount = totalEstimate - limit;
  objectNode.id = objectId;
  objectNode.label = objectIRIArr[objectIRIArr.length - 1];
  objectNode.parentDocUri = nodeToExpand;
  objectNode.predicateIri = queryObj.predicateFilter;
  objectNode.group = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);
  objectNode.isConcept = false;
  objectNode.count = nodeCount;
  objectNode.hasRelationships = false;
  nodes.push(objectNode);
  const edge = {};
  const predicateArr = queryObj.predicateFilter.split("/");
  const edgeLabel = predicateArr[predicateArr.length - 1];
  edge.id = "edge-" + objectId;
  edge.predicate = queryObj.predicateFilter;
  edge.label = edgeLabel;
  edge.from = nodeToExpand;
  edge.to = objectId;
  edges.push(edge);
}

const response = {
  'total': totalEstimate,
  'limit': limit,
  'nodes': nodes,
  'edges': edges
};

response;
