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

const sem = require("/MarkLogic/semantics.xqy");
const op = require('/MarkLogic/optic');
const {getPredicatesByModel} = require("./entity-lib.sjs");
const {val} = require("../../third-party/fast-xml-parser/src/xmlNode");
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
  let subjectPlanConcept = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?objectIRI (?objectIRI AS ?objectConcept) ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                          ?predicateIRI  ?objectIRI;
                          rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                          ?subjectIRI @predicateConceptList ?objectIRI.
                        }
                        }`).where(ctsQueryCustom);
  const conceptClass = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT (?subjectIRI AS ?conceptClassName) (?predicateIRI AS ?entityID) (MIN(?anyConceptLabel) AS ?conceptLabel) ?objectIRI ?docURI  WHERE {
                        ?predicateIRI rdf:type @entityTypeIRIs.
                        ?subjectIRI ?predicateIRI ?objectIRI.
                        OPTIONAL {
                          ?subjectIRI @labelIRI ?anyConceptLabel.
                        }
                 }
                 GROUP BY ?conceptClassName ?entityID ?objectIRI ?docURI`);
  let joinOnConceptClass = op.on(op.col("subjectIRI"),op.col("entityID"));
  subjectPlanConcept = subjectPlanConcept.joinLeftOuter(conceptClass, joinOnConceptClass);

  const countConceptRelationsWithOtherEntity = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?objectIRI (COUNT(?objectIRI) AS ?countRelationsWithOtherEntity)   WHERE {
                        ?subjectIRI rdf:type @entitiesDifferentFromBaseAndRelated;
                        ?predicateIRI  ?objectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                        ?subjectIRI @predicateConceptList ?objectIRI.
                        }
                       }
                       GROUP BY ?objectIRI
`);

  const subjectPlan = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?subjectLabel ?docURI WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs;
                      rdfs:isDefinedBy ?docURI.
                    OPTIONAL {
                      ?subjectIRI @labelIRI ?subjectLabel.
                    }
                  }`).where(ctsQueryCustom);
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
  `);
  let joinOn = op.on(op.col("subjectIRI"),op.col("subjectIRI"));
  let joinOnObjectIri = op.on(op.col("objectIRI"),op.col("objectIRI"));
  let fullPlan = subjectPlan.joinLeftOuter(firstLevelConnectionsPlan, joinOn).limit(limit);
  let fullPlanConcept = subjectPlanConcept.joinLeftOuter(countConceptRelationsWithOtherEntity, joinOnObjectIri);
  if(conceptFacetList != null && conceptFacetList.length >= 1){
    const filterConceptsQuery = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?objectIRI (?objectIRI AS ?objectConcept) ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                         ?subjectIRI ?predicateIRI @conceptFacetList.
                        }
                        }`)
    fullPlanConcept = filterConceptsQuery.joinLeftOuter(fullPlanConcept, joinOn);

  }
  if (entityTypeIRIs.length > 1) {
    let otherEntityIRIs = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?docURI ?predicateIRI  (MIN(?anyPredicateLabel) as ?predicateLabel)  ?objectIRI  (MIN(?anyObjectLabel) as ?objectLabel) WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs;
                    rdfs:isDefinedBy ?docURI;
                    ?predicateIRI ?objectIRI.
                    ?objectIRI rdf:type @entityTypeIRIs.
                    OPTIONAL {
                      ?predicateIRI @labelIRI ?anyPredicateLabel.
                    }
                    OPTIONAL {
                      ?objectIRI @labelIRI ?anyObjectLabel.
                    }
                  }
                  GROUP BY ?subjectIRI ?docURI ?predicateIRI ?objectIRI
                `).where(ctsQuery);
    fullPlan = fullPlan.union(subjectPlan.joinLeftOuter(otherEntityIRIs, joinOn).limit(limit));
  }

  fullPlanConcept = fullPlanConcept.joinInner(subjectPlan, joinOn);
  fullPlan = fullPlan.union(fullPlanConcept);
  return fullPlan.result(null, {conceptFacetList, entitiesDifferentFromBaseAndRelated, entityTypeIRIs, predicateConceptList, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
}

function getEntityNodes(documentUri, predicateIRI, lastObjectIRI, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?subjectIRI ?firstDocURI ?predicateIRI (MIN(?anyPredicateLabel) as ?predicateLabel) ?firstObjectIRI WHERE {
        ?subjectIRI rdfs:isDefinedBy @parentDocURI.
        {
            ?subjectIRI ?predicateIRI ?firstObjectIRI.
        } UNION {
            ?firstObjectIRI ?predicateIRI ?subjectIRI.
        }
        ?firstObjectIRI rdfs:isDefinedBy ?firstDocURI.
        OPTIONAL {
            ?predicateIRI @labelIRI ?anyPredicateLabel.
        }
        ${lastObjectIRI ? "FILTER ?subjectIRI > @lastObjectIRI" : ""}
      }
      GROUP BY ?subjectIRI ?docURI ?predicateIRI ?firstObjectIRI
      ORDER BY ?subjectIRI
`).where(op.eq(op.col('predicateIRI'), predicateIRI)).limit(limit);
  return subjectPlan.result(null, { parentDocURI: documentUri, lastObjectIRI, labelIRI: getOrderedLabelPredicates()}).toArray();

}

function getEntityNodesExpandingConcept(objectConceptIRI, limit) {

  const getNodeByConcept =  op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?objectIRI ?docURI  WHERE {
                    {
                        ?subjectIRI ?predicateIRI  ?objectIRI.
                    } UNION {
                        ?objectIRI ?predicateIRI ?subjectIRI.
                    }
                    FILTER (isIRI(?objectIRI) && ?objectIRI = @objectConceptIRI)
                    OPTIONAL {
                        ?subjectIRI rdfs:isDefinedBy ?docURI.
                    }
                    FILTER isIRI(?subjectIRI)
                 }`).limit(limit);
  return getNodeByConcept.result(null, {objectConceptIRI }).toArray();

}

function getEntityNodesByDocument(docURI, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?subjectIRI ?predicateIRI (MIN(?anyPredicateLabel) AS ?predicateLabel) (MIN(?objectIRI) AS ?firstObjectIRI) (MIN(?objectDocUri) AS ?firstDocURI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
          ?subjectIRI rdfs:isDefinedBy @docURI.
          {
              ?subjectIRI ?predicateIRI ?objectIRI
          } UNION {
              ?objectIRI ?predicateIRI ?subjectIRI
          }
          OPTIONAL {
              ?objectIRI rdfs:isDefinedBy ?objectDocUri.
          }
          OPTIONAL {
            ?predicateIRI @labelIRI ?anyPredicateLabel.
          }
          FILTER EXISTS {
            {
                ?subjectIRI @allPredicates ?objectIRI
            } UNION {
                ?objectIRI @allPredicates ?subjectIRI
            }
          }
      }
      GROUP BY ?subjectIRI ?predicateIRI
  `).limit(limit);

  const relatedPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT DISTINCT(?subjectIRI AS ?subjectNew) ?docRelated  WHERE {
          ?subjectIRI rdf:type ?entityTypeOrConceptIRI.
          ?subjectIRI ?predicateIRI ?objectIRI;
          rdfs:isDefinedBy ?docRelated.
      }
  `)

  let joinOn = op.on(op.col("firstObjectIRI"),op.col("subjectNew"));
  let fullPlan = subjectPlan.joinLeftOuter(relatedPlan, joinOn);

  return fullPlan.result(null, {docURI, labelIRI: getOrderedLabelPredicates(), allPredicates: getAllPredicates()}).toArray();
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

function getEntityTypeIRIsCounting(entityTypeIRIs,ctsQueryCustom) {
  const totalCountEntityBaseEntities = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT (COUNT(DISTINCT(?docUri)) AS ?total)  WHERE {
?subjectIRI rdf:type @entityTypeIRIs;
    rdfs:isDefinedBy ?docUri.
} `).where(ctsQueryCustom);

  return totalCountEntityBaseEntities.result(null,{entityTypeIRIs});
}

function getConceptCounting(entityTypeIRIs, predicateConceptList, ctsQueryCustom) {
  const totalConcepts = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT (COUNT(DISTINCT(?objectIRI)) AS ?total) WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        FILTER EXISTS {
                        ?subjectIRI @predicateConceptList ?objectIRI.
                        }
                        }`).where(ctsQueryCustom);
  return totalConcepts.result(null,{entityTypeIRIs,predicateConceptList});
}

function relatedObjHasRelationships(objectIRI) {
  let predicatesMap = getPredicatesMap();
  let hasRelationships = false;
  const objectIRIArr = objectIRI.split("/");
  const objectEntityName = objectIRIArr[objectIRIArr.length - 2];
  if (predicatesMap.has(objectEntityName)) {
    const predicates = predicatesMap.get(objectEntityName);
    const relationshipsFirstObjectCount = cts.estimate(cts.orQuery([
      cts.tripleRangeQuery(sem.iri(objectIRI), predicates, null),
      cts.tripleRangeQuery(null, predicates, sem.iri(objectIRI))
    ]));
    if (relationshipsFirstObjectCount >= 1) {
      hasRelationships = true;
    }
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
  const subjectPlanConcept = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 PREFIX mlDH: <http://www.marklogic.com/data-hub#>
                 PREFIX es: <http://marklogic.com/entity-services#>

                 SELECT DISTINCT ?objectIRI ?objectConcept ?conceptClassName ?entityTypeIRI WHERE {
                        ?entityTypeIRI rdf:type es:EntityType;
                              mlDH:relatedConcept ?conceptClassName.
                        ?conceptClassName mlDH:conceptPredicate ?conceptPredicate.
                        {
                            ?subjectIRI ?conceptPredicate ?objectConcept.
                        } UNION {
                            ?objectConcept ?conceptPredicate ?subjectIRI.
                        }
                        FILTER EXISTS {
                            ?subjectIRI @predicateConceptList ?objectConcept;
                                rdf:type @entityTypeIRIs.
                        }
                 }`);

  return subjectPlanConcept.result(null, {entityTypeIRIs, predicateConceptList}).toArray();
}

function getRelatedEntityInstancesCount(semanticConceptIRI) {
  const relatedEntityInstancesCount = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT (COUNT(DISTINCT(?subjectIRI)) AS ?total) ?entityTypeIRI  WHERE {
        ?entityTypeIRI rdf:type <http://marklogic.com/entity-services#EntityType>.
        ?subjectIRI ?p @semanticConceptIRI;
            rdf:type ?entityTypeIRI.
    }
    GROUP BY ?entityTypeIRI`
  )
  return relatedEntityInstancesCount.result(null, { semanticConceptIRI }).toObject();
}

function describeIRI(semanticConceptIRI) {
  const description = {};
  const describeTriples = sem.sparql(`DESCRIBE @semanticConceptIRI`, { semanticConceptIRI });
  for (const triple of describeTriples) {
    description[fn.string(sem.triplePredicate(triple))] = fn.string(sem.tripleObject(triple));
  }
  return description;
}

module.exports = {
  describeIRI,
  getAllPredicates,
  getEntityNodesWithRelated,
  getEntityNodes,
  getEntityNodesByDocument,
  getEntityNodesExpandingConcept,
  getEntityTypeIRIsCounting,
  getRelatedEntitiesCounting,
  getConceptCounting,
  relatedObjHasRelationships,
  getRelatedEntityInstancesCount,
  getEntityWithConcepts
}
