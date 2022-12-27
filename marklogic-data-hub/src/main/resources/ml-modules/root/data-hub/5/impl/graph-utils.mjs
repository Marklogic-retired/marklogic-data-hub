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

import consts from "/data-hub/5/impl/consts.mjs"
import entityLib from "/data-hub/5/impl/entity-lib.mjs"
import entitySearchLib from "/data-hub/5/entities/entity-search-lib"
import hubUtils from "/data-hub/5/impl/hub-utils.mjs"
import op from '/MarkLogic/optic';
import sjsProxy from "/data-hub/core/util/sjsProxy";
import {getPredicatesByModel} from "./entity-lib.mjs"

const sem = sjsProxy.requireSjsModule("/MarkLogic/semantics.xqy");

const hubCentralConfig = cts.doc("/config/hubCentral.json");
const graphDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_GRAPH_DEBUG);
const graphTraceEnabled = xdmp.traceEnabled(consts.TRACE_GRAPH) || graphDebugTraceEnabled;
const graphTraceEvent = xdmp.traceEnabled(consts.TRACE_GRAPH) ? consts.TRACE_GRAPH : consts.TRACE_GRAPH_DEBUG;

const ctsQuery = cts.trueQuery();

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

function getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, predicateConceptList, entitiesDifferentFromBaseAndRelated, conceptFacetList, ctsQueryCustom, limit) {
  let collectionQuery = cts.query({ collectionQuery: { uris: getAllEntityIds()}});
  let subjectPlan = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?subjectLabel ?docURI WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs;
                      rdfs:isDefinedBy ?docURI.
                    OPTIONAL {
                      ?subjectIRI @labelIRI ?subjectLabel.
                    }
                  }`)
  if (ctsQueryCustom instanceof cts.query) {
    subjectPlan = subjectPlan.where(ctsQueryCustom);
  }
  const firstLevelConnectionsPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?subjectIRI ?predicateIRI (MIN(?anyPredicateLabel) AS ?predicateLabel) (MIN(?objectIRI) AS ?firstObjectIRI) (MIN(?docURI) AS ?firstDocURI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
          {
              ?subjectIRI ?predicateIRI ?objectIRI.
          } UNION {
              ?objectIRI ?predicateIRI ?subjectIRI.
          }
          ?objectIRI rdf:type @entityTypeOrConceptIRI;
              rdfs:isDefinedBy ?docURI.
          OPTIONAL {
            ?predicateIRI @labelIRI ?anyPredicateLabel.
          }
      }
      GROUP BY ?subjectIRI ?predicateIRI
  `).where(collectionQuery);
  let joinOn = op.on(op.col("subjectIRI"),op.col("subjectIRI"));
  let joinOnObjectIri = op.on(op.col("firstObjectIRI"),op.col("firstObjectIRI"));
  let fullPlan = subjectPlan.joinLeftOuter(firstLevelConnectionsPlan, joinOn).limit(limit);
  if (entityTypeIRIs.length > 1) {
    let otherEntityIRIs = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>             PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>             SELECT ?subjectIRI ?docURI ?predicateIRI  (MIN(?anyPredicateLabel) as ?predicateLabel)  ?firstObjectIRI  (MIN(?docObjectURI) AS ?firstDocURI) (MIN(?anyObjectLabel) as ?objectLabel) WHERE {
                ?subjectIRI rdf:type @entityTypeIRIs;
                rdfs:isDefinedBy ?docURI;
                ?predicateIRI ?firstObjectIRI.
                ?firstObjectIRI rdf:type @entityTypeIRIs.
                ?firstObjectIRI rdf:type @entityTypeIRIs;
                    rdfs:isDefinedBy ?docObjectURI.
                OPTIONAL {
                  ?predicateIRI @labelIRI ?anyPredicateLabel.
                }
                OPTIONAL {
                  ?firstObjectIRI @labelIRI ?anyObjectLabel.
                }
              }
              GROUP BY ?subjectIRI ?docURI ?predicateIRI ?firstObjectIRI
            `);
    fullPlan = fullPlan.union(subjectPlan.joinLeftOuter(otherEntityIRIs, joinOn).limit(limit));
  }
  // Can't run concept specific queries before ML 10.0-9 due to BugTrack https://bugtrack.marklogic.com/57077
  if (supportsGraphConceptsSearch()) {
    let subjectPlanConcept = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?firstObjectIRI ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                          ?predicateIRI  ?firstObjectIRI;
                          rdfs:isDefinedBy ?docURI.
                        FILTER (isIRI(?predicateIRI) && ?predicateIRI = @predicateConceptList)
                        }`)
    if (ctsQueryCustom instanceof cts.query) {
      subjectPlanConcept = subjectPlanConcept.where(ctsQueryCustom);
    }
    const conceptClass = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?conceptClassName (MIN(?anyConceptLabel) AS ?conceptLabel) ?firstObjectIRI  WHERE {
                        @entityTypeIRIs <http://www.marklogic.com/data-hub#relatedConcept> ?conceptClassName.
                        ?conceptClassName <http://www.marklogic.com/data-hub#conceptPredicate> ?predicateIRI.
                        ?subjectIRI ?predicateIRI ?firstObjectIRI.
                        OPTIONAL {
                          ?firstObjectIRI @labelIRI ?anyConceptLabel.
                        }
                 }
                 GROUP BY ?conceptClassName ?subjectIRI ?firstObjectIRI`);
    let joinOnConceptClass = op.on(op.col("subjectIRI"), op.col("subjectIRI"));
    subjectPlanConcept = subjectPlanConcept.joinLeftOuter(conceptClass, joinOnConceptClass);

    const countConceptRelationsWithOtherEntity = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?firstObjectIRI (COUNT(?firstObjectIRI) AS ?countRelationsWithOtherEntity)   WHERE {
                        ?subjectIRI rdf:type @entitiesDifferentFromBaseAndRelated;
                        ?predicateIRI  ?firstObjectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER (isIRI(?predicateIRI) && ?predicateIRI = @predicateConceptList)
                       }
                       GROUP BY ?firstObjectIRI
    `);
    let fullPlanConcept = subjectPlanConcept.joinLeftOuter(countConceptRelationsWithOtherEntity, joinOnObjectIri);
    if(conceptFacetList != null && conceptFacetList.length >= 1){
      const filterConceptsQuery = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?firstObjectIRI ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?firstObjectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER (isIRI(?firstObjectIRI) && ?firstObjectIRI = @conceptFacetList)
                        }`)
      fullPlanConcept = filterConceptsQuery.joinLeftOuter(fullPlanConcept, joinOn);
    }
    fullPlanConcept = fullPlanConcept.joinInner(subjectPlan, joinOn);
    fullPlan = fullPlan.union(fullPlanConcept.limit(limit));
  }
  return fullPlan.result(null, {conceptFacetList, entitiesDifferentFromBaseAndRelated, entityTypeIRIs, predicateConceptList, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
}

let _allEntityIds = null;

function getAllEntityIds() {
  if (!_allEntityIds) {
    _allEntityIds = fn.collection(entityLib.getModelCollection()).toArray().map(model => model.toObject().info.title);
  }
  return _allEntityIds;
}

function getEntityNodes(documentUri, predicateIRI, lastObjectIRI, limit) {
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Creating plan for graph nodes and edges for '${documentUri}' ${predicateIRI ? `with predicate '${predicateIRI}'`: ""}and limit of ${limit}`);
  }
  const results = sem.sparql(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?subjectIRI ?docURI ?firstDocURI ?predicateIRI (MIN(?anyPredicateLabel) AS ?predicateLabel) ?firstObjectIRI WHERE {
        ?subjectIRI rdfs:isDefinedBy ?docURI.
        {
            ?subjectIRI ?predicateIRI ?firstObjectIRI.
        } UNION {
            ?firstObjectIRI ?predicateIRI ?subjectIRI.
        }
        OPTIONAL {
            ?firstObjectIRI rdfs:isDefinedBy ?firstDocURI.
        }
        OPTIONAL {
            ?predicateIRI @labelIRI ?anyPredicateLabel.
        }
        FILTER (isLiteral(?docURI) && ?docURI = $parentDocURI && isIRI(?predicateIRI) && ?predicateIRI = $matchPredicate)
        ${lastObjectIRI ? "FILTER ?subjectIRI > $lastObjectIRI" : ""}
      }
      GROUP BY ?subjectIRI ?docURI ?predicateIRI ?firstObjectIRI
      ORDER BY ?subjectIRI
      LIMIT $limit
`, { parentDocURI: documentUri, lastObjectIRI, matchPredicate: predicateIRI, labelIRI: getOrderedLabelPredicates(), limit }, [], cts.collectionQuery(getAllEntityIds()));
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Retrieved ${fn.count(results)} rows for document '${documentUri}' ${predicateIRI ? `with predicate '${predicateIRI}'`: ""}and limit of ${limit}`);
  }
  if (graphDebugTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Results for node expand '${xdmp.describe(results, Sequence.from([]), Sequence.from([]))}'`);
  }
  return results.toArray();

}

function getEntityNodesExpandingConcept(objectConceptIRI, limit) {
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Creating plan for graph nodes and edges for concept '${objectConceptIRI}' with limit of ${limit}`);
  }
  const results =  sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?firstObjectIRI ?docURI ?firstDocURI  WHERE {
                    {
                        ?firstObjectIRI ?predicateIRI ?subjectIRI.
                    } UNION {
                        ?subjectIRI ?predicateIRI ?firstObjectIRI.
                    }
                    FILTER (isIRI(?firstObjectIRI) && isIRI(?subjectIRI) && ?subjectIRI = $objectConceptIRI)
                    OPTIONAL {
                        ?subjectIRI rdfs:isDefinedBy ?docURI.
                    }
                    OPTIONAL {
                        ?firstObjectIRI rdfs:isDefinedBy ?firstDocURI.
                    }
                 }
                 LIMIT $limit
    `, {objectConceptIRI, limit}, []);
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Retrieved ${fn.count(results)} rows for concept '${objectConceptIRI}' with limit of ${limit}`);
  }
  if (graphDebugTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Results for node expand '${xdmp.describe(results, Sequence.from([]), Sequence.from([]))}'`);
  }
  return results.toArray();

}



function getEntityNodesByDocument(docURI, limit) {
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Creating plan for graph nodes and edges for document '${docURI}' with limit of ${limit}`);
  }
  // Using separate sem.sparql calls, instead of an Optic join to avoid a seg fault with ML 10.0-7
  const bindings = {parentDocURI: docURI, labelIRI: getOrderedLabelPredicates(), allPredicates: getAllPredicates(), limit};
  const collectionQuery = cts.collectionQuery(getAllEntityIds());
  const subjectResults = sem.sparql(`
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT * WHERE {
        {
          SELECT ?subjectIRI ?docURI ?predicateIRI (MIN(?anyPredicateLabel) AS ?predicateLabel) (MIN(?objectIRI) AS ?firstObjectIRI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
              ?subjectIRI rdfs:isDefinedBy ?docURI.
              {
                  ?subjectIRI ?predicateIRI ?objectIRI
              } UNION {
                  ?objectIRI ?predicateIRI ?subjectIRI
              }
              OPTIONAL {
                ?predicateIRI $labelIRI ?anyPredicateLabel.
              }
              FILTER (isLiteral(?docURI) && ?docURI = $parentDocURI && ?predicateIRI = $allPredicates)
          }
          GROUP BY ?subjectIRI ?predicateIRI
        }
        OPTIONAL {
            ?firstObjectIRI rdfs:isDefinedBy ?firstDocURI.
        }
        OPTIONAL {
          ?subjectIRI rdf:type ?entityType.
          ?entityType <http://www.marklogic.com/data-hub#relatedConcept> ?conceptClassName.
          ?conceptClassName <http://www.marklogic.com/data-hub#conceptPredicate> ?predicateIRI.
        }
      }
  `, bindings, [], collectionQuery).toArray();
  if (graphDebugTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Subject (${docURI}) results for  node expand '${xdmp.describe(subjectResults, Sequence.from([]), Sequence.from([]))}'`);
  }
  if (subjectResults.length === 0) {
    return subjectResults;
  }
  const allPredicates = bindings.allPredicates;
  const firstObjectIRIs = subjectResults.map(result => result.firstObjectIRI);
  const relatedQuery = cts.orQuery([
    cts.tripleRangeQuery(firstObjectIRIs, allPredicates, []),
    cts.tripleRangeQuery([], allPredicates, firstObjectIRIs)
  ]);
  const relatedConnections = sem.sparql(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?firstObjectIRI ?additionalEdge ?additionalIRI ?docRelated  WHERE {
          ?firstObjectIRI rdf:type ?entityTypeOrConceptIRI.
          {
            ?firstObjectIRI ?additionalEdge ?additionalIRI.
          } UNION {
            ?additionalIRI ?additionalEdge ?firstObjectIRI.
          }
          FILTER (isIRI(?additionalEdge) && ?additionalEdge = $allPredicates)
      }
  `, bindings, [], relatedQuery).toArray();
  if (graphDebugTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Additional connections (${docURI}) results for  node expand '${xdmp.describe(relatedConnections, Sequence.from([]), Sequence.from([]))}'`);
  }
  if (relatedConnections.length === 0) {
    return subjectResults;
  }
  const combinedResults = [];
  const rdfsIsDefinedBy = sem.curieExpand("rdfs:isDefinedBy");
  for (const subject of subjectResults) {
    const firstObjectIriStr = fn.string(subject.firstObjectIRI);
    const additionalEdges = relatedConnections.filter(row => firstObjectIriStr === fn.string(row.firstObjectIRI));
    if (additionalEdges.length === 0) {
      combinedResults.push(subject);
    } else {
      if (graphDebugTraceEnabled) {
        xdmp.trace(graphTraceEvent, `Additional edges found for (${firstObjectIriStr}) additional edges: '${xdmp.describe(additionalEdges, Sequence.from([]), Sequence.from([]))}'`);
      }
      for (const additionalEdge of additionalEdges) {
        const definedByTriples = cts.triples(additionalEdge.additionalIRI, rdfsIsDefinedBy);
        if (fn.exists(definedByTriples)) {
          if (graphDebugTraceEnabled) {
            xdmp.trace(graphTraceEvent, `Additional documents found for (${additionalEdge.additionalIRI}): '${xdmp.describe(definedByTriples, Sequence.from([]), Sequence.from([]))}'`);
          }
          for (const triple of definedByTriples) {
            combinedResults.push(Object.assign({docRelated: sem.tripleObject(triple)}, additionalEdge, subject));
          }
        } else {
          combinedResults.push(Object.assign({}, additionalEdge, subject));
        }
      }
    }
  }
  if (graphDebugTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Combined (${docURI}) results for  node expand '${xdmp.describe(combinedResults, Sequence.from([]), Sequence.from([]))}'`);
  }
  if (graphTraceEnabled) {
    xdmp.trace(graphTraceEvent, `Created plan for document '${docURI}' with limit of ${limit}`);
  }
  return combinedResults;
}

function getNodeLabel(objectIRIArr, objectUri) {
  let label = "";
  let configurationLabel = getLabelFromHubConfigByEntityType(objectIRIArr[objectIRIArr.length - 2]);
  if(configurationLabel.length > 0){
    //getting the value of the configuration property
    label = fn.string(getValueFromProperty(configurationLabel,objectUri,objectIRIArr[objectIRIArr.length - 2]));
  }

  if (label.length === 0) {
    label = objectIRIArr[objectIRIArr.length - 1];
  }
  return label;
}

function shouldCreateGroupNode(item, entityType, entityTypeIds, isSearch) {
  let allEntitiesAreSelected = entityTypeIds.length === fn.count(fn.collection(entityLib.getModelCollection()));
  return fn.exists(item.nodeCount) && fn.head(item.nodeCount) > 1
      && !(allEntitiesAreSelected === true && isSearch === true ) && !(entityTypeIds.includes(entityType) && isSearch === true);
}

function graphResultsToNodesAndEdges(result, entityTypeIds = [], isSearch = true, excludeOriginNode = false) {
  const nodesByID = {};
  const edgesByID = {};
  const docUriToSubjectIri = {};
  const distinctIriPredicateCombos = {};
  const groupNodeCount = {};
  const getEdgeCount = (iri) => {
    if (!distinctIriPredicateCombos[iri]) {
      return 0;
    }
    return distinctIriPredicateCombos[iri].size + (groupNodeCount[iri] || 0);
  };
  for (const item of result) {
    const subjectIri = fn.string(item.subjectIRI);
    if (!distinctIriPredicateCombos[subjectIri]) {
      distinctIriPredicateCombos[subjectIri] = new Set();
    }
    const predicateIri = fn.string(item.predicateIRI);
    const objectIri = fn.string(item.firstObjectIRI);
    if (fn.exists(item.docURI)) {
      const subjectUri = fn.string(item.docURI);
      docUriToSubjectIri[subjectUri] = docUriToSubjectIri[subjectUri] || [];
      if (!docUriToSubjectIri[subjectUri].includes(subjectIri)) {
        docUriToSubjectIri[subjectUri].push(subjectIri);
      }
    }
    if ((fn.empty(item.nodeCount) || fn.head(item.nodeCount) === 1) && objectIri) {
      if (!distinctIriPredicateCombos[objectIri]) {
        distinctIriPredicateCombos[objectIri] = new Set();
      }
      distinctIriPredicateCombos[objectIri].add(`${predicateIri}-${subjectIri}`);
      distinctIriPredicateCombos[subjectIri].add(`${predicateIri}-${objectIri}`);
      if (fn.exists(item.firstDocURI)) {
        const objectUri = fn.string(item.firstDocURI);
        docUriToSubjectIri[objectUri] = docUriToSubjectIri[objectUri] || [];
        if (!docUriToSubjectIri[objectUri].includes(objectIri)) {
          docUriToSubjectIri[objectUri].push(objectIri);
        }
      }
    } else {
      groupNodeCount[subjectIri] = (groupNodeCount[subjectIri] || 0) + fn.head(item.nodeCount);
    }
  }

  const getUrisByIRI = (iri) => Object.keys(docUriToSubjectIri).filter(key => docUriToSubjectIri[key].includes(iri));
  for (const item of result) {
    let resultPropertiesOnHover = [];
    let newLabel = "";
    const docUri = fn.string(item.docURI);
    const subjectIri = docUriToSubjectIri[docUri] ? docUriToSubjectIri[docUri][0] : fn.string(item.subjectIRI);
    const subjectArr = subjectIri.split("/");
    let subjectLabel = subjectArr[subjectArr.length - 1];
    const originHasDoc = docUri !== "";
    const group = originHasDoc ? subjectIri.substring(0, subjectIri.length - subjectLabel.length - 1): subjectIri;
    let entityType = subjectArr.length >= 2 ? subjectArr[subjectArr.length - 2]: "";
    if (!item.subjectLabel || fn.string(item.subjectLabel).length === 0) {
      //check if we have in central config new label loaded
      if(originHasDoc) {
        //get configuration values from Hub Central Config
        let configurationLabel = getLabelFromHubConfigByEntityType(entityType);
        //getting the value of the configuration property
        newLabel = getValueFromProperty(configurationLabel, docUri, entityType);
        //check if we have in central config properties on hover loaded
        resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(docUri,entityType,hubCentralConfig);
      } else {
        newLabel = fn.string(item.predicateLabel);
      }
    } else {
      newLabel = fn.string(item.subjectLabel);
    }
    const objectIRI = fn.string(item.firstObjectIRI);
    const objectIRIArr = objectIRI.split("/");
    const objectUri = fn.string(item.firstDocURI);
    const objectHasDoc = objectUri !== "";
    const originId = originHasDoc ? docUri : subjectIri;
    const predicateArr = fn.string(item.predicateIRI).split("/");
    const edgeLabel = predicateArr[predicateArr.length - 1];
    if (!(nodesByID[originId] || excludeOriginNode)) {
      const nodeOrigin = {};
      nodeOrigin.id = originId;
      nodeOrigin.docUri = docUri;
      nodeOrigin.docIRI = subjectIri;
      if (!newLabel || newLabel.length === 0) {
        nodeOrigin.label = subjectLabel;
      } else {
        nodeOrigin.label = newLabel;
      }
      nodeOrigin.additionalProperties = null;
      nodeOrigin.group = group;
      nodeOrigin.isConcept = false;
      const edgeCount = docUriToSubjectIri[item.docURI] ? docUriToSubjectIri[item.docURI].reduce((total, iri) => total + getEdgeCount(iri), 0): getEdgeCount(subjectIri);
      nodeOrigin.edgeCount = edgeCount;
      nodeOrigin.hasRelationships = docUriToSubjectIri[item.docURI] ? docUriToSubjectIri[item.docURI].some(iri => relatedObjHasRelationships(iri, edgeCount)): relatedObjHasRelationships(subjectIri, edgeCount);
      nodeOrigin.count = 1;
      nodeOrigin.propertiesOnHover = resultPropertiesOnHover;

      const doc = cts.doc(docUri);
      const unmergeDetails = entitySearchLib.fetchUnmergeDetails(doc, entityType);
      nodeOrigin.unmerge = unmergeDetails["unmerge"];
      nodeOrigin.unmergeUris = unmergeDetails["unmergeUris"];
      nodeOrigin.matchStepName = unmergeDetails["matchStepName"] ? unmergeDetails["matchStepName"] : undefined;
      nodesByID[item.docURI] = nodeOrigin;
    }
    if (fn.exists(item.firstObjectIRI)) {
      //Checking for target nodes
      if (fn.empty(item.nodeCount) || fn.head(item.nodeCount) === 1) {
        let edge = {};
        const docUriToNodeKeys = getUrisByIRI(objectIRI);
        const buildNodesAndEdgesFunction = key => {
          const objectIRI = docUriToSubjectIri[key] ? docUriToSubjectIri[key][0] : key;
          const objectIRIArr = objectIRI.split("/");
          const isDocument = cts.exists(cts.documentQuery(key));
          const objectEntityType = objectIRIArr[objectIRIArr.length - 2];
          const objectGroup = (isDocument || entityTypeIds.includes(objectEntityType)) ? objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1): objectIRI;
          edge = {};
          const sortedIds = [originId, key].sort();
          edge.id = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
          if (!edgesByID[edge.id]) {
            edge.predicate = item.predicateIRI;
            edge.label = edgeLabel;
            edge.from = sortedIds[0];
            edge.to = sortedIds[1];
            edgesByID[edge.id] = edge;
          }
          if (!nodesByID[key]) {
            let objectNode = {};
            objectNode.id = key;
            objectNode.docUri = isDocument ? key : item.firstDocURI ? item.firstDocURI : null;
            objectNode.docIRI = objectIRI;
            objectNode.label = isDocument ? getNodeLabel(objectIRIArr, key): (fn.string(item.conceptLabel) || objectIRIArr[objectIRIArr.length - 1]);
            resultPropertiesOnHover = isDocument ? entityLib.getValuesPropertiesOnHover(key, objectEntityType, hubCentralConfig) : "";
            objectNode.propertiesOnHover = resultPropertiesOnHover;
            objectNode.group = objectGroup;
            objectNode.isConcept = !(isDocument || entityTypeIds.includes(objectEntityType));
            objectNode.conceptClassName = item.conceptClassName;
            objectNode.count = item.nodeCount;
            const edgeCount = docUriToSubjectIri[objectNode.docUri] ? docUriToSubjectIri[objectNode.docUri].reduce((total, iri) => total + getEdgeCount(iri), 0): getEdgeCount(objectIRI);
            objectNode.edgeCount = edgeCount;
            objectNode.hasRelationships = docUriToSubjectIri[objectNode.docUri] ? docUriToSubjectIri[objectNode.docUri].some(iri => relatedObjHasRelationships(iri, edgeCount)): relatedObjHasRelationships(objectIRI, edgeCount, objectNode.isConcept);
            nodesByID[key] = objectNode;
          }
        };
        //if the target exists in docUriToSubjectIri we check for multiple nodes
        if (docUriToNodeKeys && docUriToNodeKeys.length > 0) {
          docUriToNodeKeys.forEach(buildNodesAndEdgesFunction);
        } else { //if there isn't a docURI key create the node from item's info
          buildNodesAndEdgesFunction(objectHasDoc ? objectUri : objectIRI);
        }
        if (fn.exists(item.additionalEdge) && item.additionalEdge.toString().length > 0) {
          const objectId = objectHasDoc ? objectUri : objectIRI;
          const additionalId = fn.exists(item.docRelated) ? item.docRelated : item.additionalIRI;
          const sortedIds = [objectId, additionalId].sort();
          const edgeId = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
          const predicateArr = item.additionalEdge.toString().split("/");
          const edgeLabel = predicateArr[predicateArr.length - 1];
          if (!edgesByID[edgeId]) {
            edgesByID[edgeId] = {
              id: edgeId,
              predicate: item.additionalEdge,
              label: edgeLabel,
              from: sortedIds[0],
              to: sortedIds[1]
            };
          }
        }
      } else if (shouldCreateGroupNode(item, objectIRIArr[objectIRIArr.length - 2], entityTypeIds, isSearch)) {
        const entityType = objectIRIArr[objectIRIArr.length - 2];
        const objectId = originId + "-" + item.predicateIRI + "-" + entityType;
        let edge = {};
        edge.id = "edge-" + objectId;
        if (!edgesByID[edge.id]) {
          edge.predicate = item.predicateIRI;
          edge.label = edgeLabel;
          edge.from = originId;
          edge.to = objectId;
          edgesByID[edge.id] = edge;
        }
        if (!nodesByID[objectId]) {
          let objectNode = {};
          objectNode.id = objectId;
          objectNode.label = objectIRIArr[objectIRIArr.length - 1];
          objectNode.parentDocUri = item.docURI;
          objectNode.predicateIri = item.predicateIRI;
          objectNode.propertiesOnHover = "";
          objectNode.group = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);
          objectNode.isConcept = false;
          objectNode.count = item.nodeCount;
          objectNode.hasRelationships = false;
          nodesByID[objectId] = objectNode;
        }
      } else if (item.predicateIRI !== undefined && item.predicateIRI.toString().length > 0) {
        const docUriToNodeKeys = getUrisByIRI(objectIRI);
        const edgeFunction = key => {
          const objectId = key;
          const sortedIds = [originId, objectId].sort();
          const edgeId = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
          if (!edgesByID[edgeId]) {
            edgesByID[edgeId] = {
              id: edgeId,
              predicate: item.predicateIRI,
              label: edgeLabel,
              from: sortedIds[0],
              to: sortedIds[1]
            };
          }
        };
        if (docUriToNodeKeys && docUriToNodeKeys.length > 0) {
          docUriToNodeKeys.forEach(edgeFunction);
        } else { //target is a concept node
          edgeFunction(objectHasDoc ? objectUri: objectIRI);
        }
      }
    }
  }
  return {
    nodes: hubUtils.getObjectValues(nodesByID),
    edges: hubUtils.getObjectValues(edgesByID)
  };
}

const labelsByEntityType = {};

function getLabelFromHubConfigByEntityType(entityType) {
  if (labelsByEntityType[entityType] === undefined) {
    const labelXPath = `/modeling/entities/${entityType}/label`;
    if (hubCentralConfig != null && cts.validExtractPath(labelXPath)) {
      labelsByEntityType[entityType] = fn.string(fn.head(hubCentralConfig.xpath(labelXPath)));
    } else {
      labelsByEntityType[entityType] = "";
    }
  }
  return labelsByEntityType[entityType];
}

const propertiesOnHoverByEntityType = {};

function getPropertiesOnHoverFromHubConfigByEntityType(entityType) {
  if (labelsByEntityType[entityType] === undefined) {
      if (hubCentralConfig != null && fn.exists(hubCentralConfig.xpath("/modeling/entities/" + entityType +"/propertiesOnHover"))) {
        const obj = JSON.parse(hubCentralConfig);
        propertiesOnHoverByEntityType[entityType] = obj.modeling.entities[entityType].propertiesOnHover;
      } else {
        propertiesOnHoverByEntityType[entityType] = "";
      }
  }
  return propertiesOnHoverByEntityType[entityType];
}

function getValueFromProperty(propertyName, docUri, entityType) {
  if (fn.exists(docUri) && entityType && propertyName) {
    const property = cts.doc(docUri).xpath(`*:envelope/*:instance/*:${entityType}/*:${propertyName}`);
    if (fn.exists(property)) {
      return fn.data(fn.head(property));
    }
  }
  return "";
}

function getRelatedEntitiesCounting(allRelatedPredicateList,ctsQueryCustom) {
  /* TODO: Investigate why mapping bindings for predicates weren't giving accurate docUri count */
  const totalCountRelated = sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT (COUNT(?docUri) as ?total) WHERE {
    ?s ${allRelatedPredicateList.map(pred => `<${fn.string(pred)}>`).join("|")} ?o.
    ?o rdfs:isDefinedBy ?docUri.
} `, {}, [], ctsQueryCustom);
  return totalCountRelated;
}

function getEntityTypeIRIsCounting(entityTypeIRIs, ctsQueryCustom) {
  const totalCountEntityBaseEntities = sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT (COUNT(DISTINCT(?docUri)) AS ?total)  WHERE {
?subjectIRI rdf:type $entityTypeIRIs;
    rdfs:isDefinedBy ?docUri.
} `,{entityTypeIRIs}, [], ctsQueryCustom);

  return totalCountEntityBaseEntities;
}

function getConceptCounting(entityTypeIRIs, predicateConceptList, ctsQueryCustom) {
  const totalConcepts = sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT (COUNT(DISTINCT(?objectIRI)) AS ?total) WHERE {
                        ?subjectIRI rdf:type $entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        FILTER (isIRI(?predicateIRI) && ?predicateIRI = $predicateConceptList)
                        }`, {entityTypeIRIs,predicateConceptList}, [], ctsQueryCustom);
  return totalConcepts;
}

function relatedObjHasRelationships(objectIRI, baseCount = 0, isConcept = false) {
  let predicatesMap = getPredicatesMap();
  let hasRelationships = false;
  const objectIRIArr = objectIRI.split("/");
  const objectEntityName = objectIRIArr[objectIRIArr.length - 2];
  if (predicatesMap.has(objectEntityName) || isConcept) {
    const predicates = isConcept ? null: predicatesMap.get(objectEntityName);
    const maxCount = baseCount + 1;
    const relationshipsFirstObjectCount = fn.count(cts.triples(sem.iri(objectIRI), predicates, null), maxCount) + fn.count(cts.triples(null, predicates, sem.iri(objectIRI)), maxCount);
    hasRelationships = relationshipsFirstObjectCount > baseCount;
  }
  return hasRelationships;
}

let predicatesMap = null;

function getPredicatesMap() {
  if (!predicatesMap) {
    predicatesMap = new Map();
    fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
      model = model.toObject();
      const entityName = model.info.title;
      predicatesMap.set(entityName, getPredicatesByModel(model, true));
    });
  }
  return predicatesMap;
}

function getAllPredicates() {
  const predicatesMap = getPredicatesMap();
  let allPredicates = [];
  predicatesMap.forEach(val => {
    allPredicates = allPredicates.concat(val);
  });
  return allPredicates;
}


function getEntityWithConcepts(entityTypeIRIs, predicateConceptList) {
  const subjectPlanConcept = sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 PREFIX mlDH: <http://www.marklogic.com/data-hub#>
                 PREFIX es: <http://marklogic.com/entity-services#>

                 SELECT DISTINCT ?objectIRI ?conceptClassName ?entityTypeIRI WHERE {
                        ?entityTypeIRI rdf:type es:EntityType;
                              mlDH:relatedConcept ?conceptClassName.
                        ?conceptClassName mlDH:conceptPredicate ?conceptPredicate.
                        ?subjectIRI ?conceptPredicate ?objectIRI.
                        FILTER (isIRI(?entityTypeIRI) && ?entityTypeIRI = $entityTypeIRIs && isIRI(?conceptPredicate) && ?conceptPredicate = $predicateConceptList)
                 }`, {entityTypeIRIs, predicateConceptList});

  return subjectPlanConcept.toArray();
}

function getRelatedEntityInstancesCount(semanticConceptIRI) {
  const relatedEntityInstancesCount = sem.sparql(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT (COUNT(DISTINCT(?subjectIRI)) AS ?total) ?entityTypeIRI  WHERE {
        ?entityTypeIRI rdf:type <http://marklogic.com/entity-services#EntityType>.
        ?subjectIRI ?p $semanticConceptIRI;
            rdf:type ?entityTypeIRI.
    }
    GROUP BY ?entityTypeIRI`, { semanticConceptIRI }
  );
  return relatedEntityInstancesCount.toObject();
}

function describeIRI(semanticConceptIRI) {
  const description = {};
  const describeTriples = sem.sparql(`DESCRIBE @semanticConceptIRI`, { semanticConceptIRI });
  for (const triple of describeTriples) {
    description[fn.string(sem.triplePredicate(triple))] = fn.string(sem.tripleObject(triple));
  }
  return description;
}

function supportsGraphConceptsSearch() {
  //
  return xdmp.effectiveVersion() >= 10000900;
}

export default {
  describeIRI,
  getAllEntityIds,
  getAllPredicates,
  getEntityNodesWithRelated,
  getEntityNodes,
  getEntityNodesByDocument,
  getEntityNodesExpandingConcept,
  getEntityTypeIRIsCounting,
  getRelatedEntitiesCounting,
  getConceptCounting,
  getRelatedEntityInstancesCount,
  getEntityWithConcepts,
  graphResultsToNodesAndEdges,
  supportsGraphConceptsSearch
}
