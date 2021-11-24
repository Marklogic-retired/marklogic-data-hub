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
const sem = require("/MarkLogic/semantics.xqy");
const op = require('/MarkLogic/optic');
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

// Alterations to rdf:type values that qualify as Concepts in Hub Central graph views go in this function.
function getRdfConceptTypes() {
  return [
    sem.curieExpand("rdf:Class"),
    sem.curieExpand("owl:Class"),
    sem.curieExpand("skos:Concept")
  ];
}

// Alterations to label predicates in order of priority
function getOrderedLabelPredicates() {
  return [
    sem.curieExpand("skos:prefLabel"),
    sem.curieExpand("skos:label"),
    sem.curieExpand("rdfs:label")
  ];
}

var query;
var start;
var pageLength;

if(query == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}

let queryObj = JSON.parse(query);
var selectedFacets = queryObj.selectedFacets;

var allEntityTypeIRIs = [];
var entityTypeIRIs = [];

start = start || 0;
pageLength = pageLength || 1000;

fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
  model = model.toObject();
  const entityName = model.info.title;


  const entityNameIri = entityLib.getEntityTypeId(model, entityName);


  if(selectedFacets && selectedFacets.relatedEntityTypeIds && selectedFacets.relatedEntityTypeIds.includes(entityName)) {
    allEntityTypeIRIs.push(sem.iri(entityNameIri));
  }

  if (queryObj.entityTypeIds.includes(entityName)) {
    entityTypeIRIs.push(sem.iri(entityNameIri));
  }
});

const relatedEntityTypeIRIs = allEntityTypeIRIs.filter((e1) => !entityTypeIRIs.some((e2) => fn.string(e1) === fn.string(e2)));
const ctsQuery = cts.trueQuery();
const subjectPlan = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 SELECT ?subjectIRI ?subjectLabel WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs.
                    OPTIONAL {
                      ?subjectIRI @labelIRI ?subjectLabel.
                    }
                  }`).where(ctsQuery);
const firstLevelConnectionsPlan = op.fromSPARQL(`
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              SELECT * WHERE {
              {
                SELECT ?subjectIRI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (COUNT(?objectIRI) AS ?nodeCount) WHERE {
                    ?objectIRI rdf:type @entityTypeOrConceptIRI.
                    ?subjectIRI ?predicateIRI ?objectIRI.
                    OPTIONAL {
                      ?predicateIRI @labelIRI ?predicateLabel.
                    }
                }
                GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel
              }
              {
                    OPTIONAL {
                      ?firstObjectIRI @labelIRI ?firstObjectLabel.
                    }
              }
              }
`);
let joinOn = op.on(op.col("subjectIRI"),op.col("subjectIRI"));
let fullPlan = subjectPlan.joinLeftOuter(firstLevelConnectionsPlan, joinOn);
if (entityTypeIRIs.length > 1) {
  let otherEntityIRIs = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 SELECT ?subjectIRI  ?predicateIRI  ?predicateLabel  ?objectIRI  ?objectLabel WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs;
                                ?predicateIRI ?objectIRI.
                    ?objectIRI rdf:type @entityTypeIRIs.
                    OPTIONAL {
                      ?predicateIRI @labelIRI ?predicateLabel.
                    }
                    OPTIONAL {
                      ?objectIRI @labelIRI ?objectLabel.
                    }
                  }`).where(ctsQuery);
  fullPlan = fullPlan.union(subjectPlan.joinLeftOuter(otherEntityIRIs, joinOn));
}

const result = fullPlan.result(null, {entityTypeIRIs, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
let nodes = [];
let edges = [];

result.map(item => {

  let nodeOrigin = {};
  if (!nodes[item.subjectIRI]) {
    nodeOrigin.id = item.subjectIRI;
    nodeOrigin.label = item.subjectLabel;
    nodeOrigin.additionaProperties = null;
    nodeOrigin.group = item.predicateIRI;
    nodeOrigin.isConcept = false;
    nodeOrigin.count = 1;
    nodes[item.subjectIRI] = nodeOrigin;
  } else {
    nodeOrigin = nodes[item.subjectIRI];
    nodeOrigin.label = item.subjectLabel || nodeOrigin.label;
    nodeOrigin.group = item.predicateIRI || nodeOrigin.group;
    nodeOrigin.additionaProperties = null;
    nodes[item.subjectIRI] = nodeOrigin;
  }

  if (item.nodeCount && item.nodeCount >= 1) {
    let edge = {};
    let objectIRI = item.firstObjectIRI.toString();
    let objectLabel = item.firstObjectLabel.toString();
    if (item.nodeCount > 1) { //If there are more than one we link the edge to the object entity type
      let entityIRIArr = objectIRI.split("/");
      let entityType = entityIRIArr[entityIRIArr.length - 2].split("-");
      objectIRI = entityType;
      objectLabel =  entityType;
    }
    edge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + objectIRI;

    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];
    edge.label = edgeLabel;

    edge.from = item.subjectIRI;
    edge.to = objectIRI;
    edges.push(edge);

    if (!nodes[item.objectIRI]) {
      let objectNode = {};
      objectNode.id = item.subjectIRI + "-" + objectIRI;
      objectNode.label = objectLabel;
      objectNode.group = null;
      objectNode.isConcept = false;
      objectNode.count = item.nodeCount;
      nodes[item.firstObjectIRI] = objectNode;
    }
  }
  else if (item.predicateIRI !== undefined && item.predicateIRI.toString().length > 0){
      let edge = {};

      let predicateArr = item.predicateIRI.toString().split("/");
      let edgeLabel = predicateArr[predicateArr.length - 1];
      edge.label = edgeLabel;
      edge.from = item.subjectIRI;
      edge.to = item.objectIRI;
      edges.push(edge);
  }

})

const totalEstimate = cts.estimate(cts.andQuery([cts.tripleRangeQuery(null, sem.curieExpand("rdf:type"), entityTypeIRIs.concat(relatedEntityTypeIRIs))]));

const nodesValues = hubUtils.getObjectValues(nodes)

const response = {
  'total': totalEstimate,
  'start': start,
  'limit': nodesValues.length,
  'nodes': nodesValues,
  'edges': edges
};

response;

