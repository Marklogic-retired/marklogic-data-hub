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

function getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, ctsQueryCustom) {
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
         SELECT ?subjectIRI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (MIN(?docURI) AS ?firstDocURI) (COUNT(?objectIRI) AS ?nodeCount) WHERE {
            ?objectIRI rdf:type @entityTypeOrConceptIRI;
            rdfs:isDefinedBy ?docURI.
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

  return fullPlan.result(null, {entityTypeIRIs, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
}

function getEntityNodes(entityTypeIRI, predicateIRI, relatedTypeIRIs, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      SELECT * WHERE {
      {
        SELECT ?subjectIRI ?predicateIRI ?predicateLabel ?objectIRI (COUNT(?objectIRI) AS ?nodeCount) WHERE {
            ?objectIRI rdf:type @relatedTypeIRIs.
            ?subjectIRI ?predicateIRI ?objectIRI.
            OPTIONAL {
              ?predicateIRI @labelIRI ?predicateLabel.
            }
        }
        GROUP BY ?subjectIRI ?predicateIRI ?predicateLabel ?objectIRI
      }
      {
            OPTIONAL {
              ?firstObjectIRI @labelIRI ?objectLabel.
            }
      }
      }
  `).where(op.eq(op.col('subjectIRI'), entityTypeIRI)).where(op.eq(op.col('predicateIRI'), predicateIRI)).limit(limit);
  return subjectPlan.result(null, {relatedTypeIRIs: relatedTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();

}

function getEntityNodesBySubject(entityTypeIRI, relatedEntityTypeIRIs, limit) {
  const subjectPlan = op.fromSPARQL(`
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      SELECT * WHERE {
      {
        SELECT ?subjectIRI ?predicateIRI ?predicateLabel (MIN(?objectIRI) AS ?firstObjectIRI) (COUNT(?objectIRI) AS ?nodeCount) WHERE {
            ?objectIRI rdf:type @entityTypeOrConceptIRI.
            @entityTypeIRI ?predicateIRI ?objectIRI.
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
  `).limit(100);
  return subjectPlan.result(null, {entityTypeIRI, entityTypeOrConceptIRI: relatedEntityTypeIRIs.concat(getRdfConceptTypes()), labelIRI: getOrderedLabelPredicates()}).toArray();
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

module.exports = {
  getEntityNodesWithRelated,
  getEntityNodes,
  getEntityNodesBySubject,
  relatedObjHasRelationships
}
