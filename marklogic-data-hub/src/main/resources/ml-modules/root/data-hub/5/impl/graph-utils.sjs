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
  let subjectPlanConcept = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>                 SELECT ?subjectIRI ?predicateIRI ?objectIRI (?objectIRI AS ?objectConcept) ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                        ?subjectIRI @predicateConceptList ?objectIRI.
                        }
                        }`).where(ctsQueryCustom);
  const conceptClass = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>                 SELECT (?subjectIRI AS ?conceptClassName) (?predicateIRI AS ?entityID) ?objectIRI ?docURI  WHERE {
                        ?predicateIRI rdf:type @entityTypeIRIs.
                        ?subjectIRI ?predicateIRI ?objectIRI.
                        }`);
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
      SELECT * WHERE {
      {
        SELECT ?subjectIRI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (MIN(?docURI) AS ?firstDocURI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
            ?objectIRI rdf:type @entityTypeOrConceptIRI;
            rdfs:isDefinedBy ?docURI.
            ?subjectIRI ?predicateIRI ?objectIRI.
            OPTIONAL {
              ?predicateIRI @labelIRI ?predicateLabel.
            }
        }
        GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel
      } UNION {
        SELECT ?subjectIRI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (MIN(?docURI) AS ?firstDocURI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
            ?subjectIRI rdf:type @entityTypeOrConceptIRI;
            rdfs:isDefinedBy ?docURI.
            ?objectIRI ?predicateIRI ?subjectIRI.
            OPTIONAL {
              ?predicateIRI @labelIRI ?predicateLabel.
            }
        }
        GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel
      }
      }
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
                 SELECT ?subjectIRI ?docURI ?predicateIRI  ?predicateLabel  ?objectIRI  ?objectLabel WHERE {
                    ?subjectIRI rdf:type @entityTypeIRIs;
                    rdfs:isDefinedBy ?docURI;
                    ?predicateIRI ?objectIRI.
                    ?objectIRI rdf:type @entityTypeIRIs.
                    OPTIONAL {
                      ?predicateIRI @labelIRI ?predicateLabel.
                    }
                    OPTIONAL {
                      ?objectIRI @labelIRI ?objectLabel.
                    }
                  }`).where(ctsQuery);
    fullPlan = fullPlan.union(subjectPlan.joinLeftOuter(otherEntityIRIs, joinOn).limit(limit));
  }

  fullPlanConcept = fullPlanConcept.joinInner(subjectPlan, joinOn);
  fullPlan = fullPlan.union(fullPlanConcept);
  return fullPlan.result(null, {conceptFacetList, entitiesDifferentFromBaseAndRelated, entityTypeIRIs, predicateConceptList, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
}

function getEntityNodes(entityTypeIRI, predicateIRI, relatedTypeIRIs, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT * WHERE {
      {
        SELECT ?subjectIRI ?docURI ?predicateIRI ?predicateLabel ?objectIRI (COUNT(?objectIRI) AS ?nodeCount) WHERE {
            {
              ?objectIRI rdf:type @relatedTypeIRIs;
              rdfs:isDefinedBy ?docURI.
              ?subjectIRI ?predicateIRI ?objectIRI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
            } UNION {
              ?subjectIRI rdf:type @relatedTypeIRIs;
              rdfs:isDefinedBy ?docURI.
              ?objectIRI ?predicateIRI ?subjectIRI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
            }
        }
        GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel ?objectIRI
      }
      }
  `).where(op.eq(op.col('subjectIRI'), entityTypeIRI)).where(op.eq(op.col('predicateIRI'), predicateIRI)).limit(limit);
  return subjectPlan.result(null, {relatedTypeIRIs: relatedTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();

}

function getEntityNodesExpandingConcept(entityTypeIRIs, objectConceptIRI, limit) {

  const getNodeByConcept =  op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?objectIRI (?objectIRI AS ?objectConcept) ?docURI  WHERE {
                    {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                            ?subjectIRI ?predicateIRI @objectConceptIRI.
                        }
                    } UNION {
                        ?objectIRI rdf:type @entityTypeIRIs;
                            ?predicateIRI  ?subjectIRI.
                        ?subjectIRI rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                            @objectConceptIRI ?predicateIRI ?subjectIRI.
                        }
                    }
                 }`).limit(limit);
  return getNodeByConcept .result(null, {objectConceptIRI, entityTypeIRIs }).toArray();

}

function getEntityNodesBySubject(entityTypeIRI, relatedEntityTypeIRIs, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT * WHERE {
      {
        SELECT ?subjectIRI ?docURI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (COUNT(DISTINCT(?objectIRI)) AS ?nodeCount) WHERE {
            {
              ?objectIRI rdf:type @entityTypeOrConceptIRI.
              @entityTypeIRI ?predicateIRI ?objectIRI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
            } UNION {
              ?objectIRI rdf:type @entityTypeOrConceptIRI;
                ?predicateIRI @entityTypeIRI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
            } 
        }
        GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel
      }
      }
  `).limit(limit);

  const relatedPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT * WHERE {
        {
          SELECT DISTINCT(?subjectIRI AS ?subjectNew) (?docURI AS ?docRelated)  WHERE {
              ?subjectIRI rdf:type @entityTypeOrConceptIRI;
                ?predicateIRI ?objectIRI;
                rdfs:isDefinedBy ?docURI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
          }
        } UNION {
          SELECT DISTINCT(?subjectIRI AS ?subjectNew) (?docURI AS ?docRelated)  WHERE {
              ?objectIRI rdf:type @entityTypeOrConceptIRI;
                ?predicateIRI ?subjectIRI.
              ?subjectIRI rdfs:isDefinedBy ?docURI.
              OPTIONAL {
                ?predicateIRI @labelIRI ?predicateLabel.
              }
          }
        }
      }
  `)

  let joinOn = op.on(op.col("firstObjectIRI"),op.col("subjectNew"));
  let fullPlan = subjectPlan.joinLeftOuter(relatedPlan, joinOn);

  return fullPlan.result(null, {entityTypeIRI, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
}


function getRelatedEntitiesCounting(allRelatedPredicateList,ctsQueryCustom) {
  const totalCountRelated = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT (COUNT(DISTINCT(?o)) AS ?total)  WHERE {
?s @allRelatedPredicateList ?o } `).where(ctsQueryCustom);
  return totalCountRelated.result(null,{allRelatedPredicateList});
}

function getEntityTypeIRIsCounting(entityTypeIRIs,ctsQueryCustom) {
  const totalCountEntityBaseEntities = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT (COUNT(DISTINCT(?subjectIRI)) AS ?total)  WHERE {
?subjectIRI rdf:type @entityTypeIRIs.
?subjectIRI ?p ?o
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

function relatedObjHasRelationships(objectIRI, predicatesMap) {
  let hasRelationships = false;
  const objectIRIArr = objectIRI.split("/");
  const objectEntityName = objectIRIArr[objectIRIArr.length - 2];
  if (predicatesMap.has(objectEntityName)) {
    const relationshipsFirstObjectCount = cts.estimate(cts.andQuery([cts.tripleRangeQuery(sem.iri(objectIRI), predicatesMap.get(objectEntityName), null)]));
    if (relationshipsFirstObjectCount >= 1) {
      hasRelationships = true;
    }
  }
  return hasRelationships;
}

function getEntityWithConcepts(entityTypeIRIs, predicateConceptList) {
  const subjectPlanConcept = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT ?subjectIRI ?predicateIRI ?objectIRI (?objectIRI AS ?objectConcept) ?docURI  WHERE {
                        ?subjectIRI rdf:type @entityTypeIRIs;
                        ?predicateIRI  ?objectIRI;
                        rdfs:isDefinedBy ?docURI.
                        FILTER EXISTS {
                        ?subjectIRI @predicateConceptList ?objectIRI.
                        }
                        }`);

  const conceptClass = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                 SELECT (?subjectIRI AS ?conceptClassName) (?predicateIRI AS ?entityID) ?objectIRI ?docURI  WHERE {

                        ?predicateIRI rdf:type @entityTypeIRIs.
                        ?subjectIRI ?predicateIRI ?objectIRI.

                        }`);

  let joinOn = op.on(op.col("subjectIRI"),op.col("entityID"));
  let fullPlan = subjectPlanConcept.joinLeftOuter(conceptClass, joinOn);

  return fullPlan.result(null, {entityTypeIRIs, predicateConceptList}).toArray();
}

function getRelatedEntityInstancesCount(semanticConceptIRI) {
  const relatedEntityInstancesCount = op.fromSPARQL(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT (COUNT(DISTINCT(?subjectIRI)) AS ?total) ?entityTypeIRI  WHERE {
        {
            ?subjectIRI ?p @semanticConceptIRI;
                rdf:type ?entityTypeIRI.
            ?entityTypeIRI rdf:type <http://marklogic.com/entity-services#EntityType>.
        } UNION {
            @semanticConceptIRI ?p ?subjectIRI.
            ?subjectIRI rdf:type ?entityTypeIRI.
            ?entityTypeIRI rdf:type <http://marklogic.com/entity-services#EntityType>.
        }
    }
    GROUP BY ?entityTypeIRI`
  )
  return relatedEntityInstancesCount.result(null, { semanticConceptIRI }).toObject();
}

module.exports = {
  getEntityNodesWithRelated,
  getEntityNodes,
  getEntityNodesBySubject,
  getEntityNodesExpandingConcept,
  getEntityTypeIRIsCounting,
  getRelatedEntitiesCounting,
  getConceptCounting,
  relatedObjHasRelationships,
  getRelatedEntityInstancesCount,
  getEntityWithConcepts
}
