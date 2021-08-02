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

// This library is intended for Data Hub specific provenance functions.

'use strict';

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

function validateDeleteRequest({ retainDuration, batchSize = 100 }) {
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "yearMonthDuration", retainDuration)) {
        retainDuration = xs.yearMonthDuration(retainDuration);
    } else if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "dayTimeDuration", retainDuration)) {
        retainDuration = xs.dayTimeDuration(retainDuration);
    } else {
        httpUtils.throwBadRequest(`The duration format for the retainDuration provided ("${retainDuration}") is unsupported. Format must be in either xs:yearMonthDuration or xs:dayTimeDuration format`);
    }
    if (retainDuration.lt(xs.dayTimeDuration('PT0S'))) {
        httpUtils.throwBadRequest(`The retainDuration provided ("${retainDuration}") is unsupported. The retain duration must be a positive duration.`);
    }
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "unsignedInt", batchSize)) {
        batchSize = xs.unsignedInt(batchSize);
    } else {
        httpUtils.throwBadRequest(`The value for the batchSize provided ("${batchSize}") is unsupported. batchSize must be an unsigned int.`);
    }
    return { retainDuration, batchSize };
}

function deleteProvenance(deleteRequest, endpointState) {
    xdmp.securityAssert("http://marklogic.com/data-hub/privileges/delete-provenance", "execute");
    // update with validated request properties
    deleteRequest = validateDeleteRequest(deleteRequest);
    const { retainDuration, batchSize } = deleteRequest;
    const timePruningBegins = fn.currentDateTime().subtract(retainDuration);
    return fn.head(xdmp.invokeFunction(function() {
        const collectionQuery = cts.collectionQuery('http://marklogic.com/provenance-services/record');
        const timeQuery = cts.tripleRangeQuery(null, sem.iri('http://www.w3.org/ns/prov#generatedAtTime'), timePruningBegins, '<');
        const lastRemovedUriQuery = endpointState.lastUri ? cts.rangeQuery(cts.uriReference(), '>=', endpointState.lastUri) : null;
        const queries = [collectionQuery, timeQuery];
        if (lastRemovedUriQuery) {
            queries.push(lastRemovedUriQuery);
        }
        const finalQuery = cts.andQuery(queries);
        let estimateCount = cts.estimate(finalQuery);
        let lastUri = null;
        for (let uri of cts.uris(null, [`limit=${batchSize}`], finalQuery)) {
            xdmp.documentDelete(uri);
            lastUri = uri;
        }
        return (lastUri !== null && estimateCount > batchSize) ? {lastUri} : null;
    }, { database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto', ignoreAmps: false}));
}

function installProvTemplates() {
  const recordProvenanceTemplate = xdmp.unquote('<template xmlns="http://marklogic.com/xdmp/tde">\n' +
    '  <context>/prov:document</context>\n' +
    '  <path-namespaces>\n' +
    '    <path-namespace>\n' +
    '      <prefix>prov</prefix>\n' +
    '      <namespace-uri>http://www.w3.org/ns/prov#</namespace-uri>\n' +
    '    </path-namespace>\n' +
    '  </path-namespaces>\n' +
    '  <collections>\n' +
    '    <collection>http://marklogic.com/provenance-services/record</collection>\n' +
    '  </collections>\n' +
    '  <templates>\n' +
    '    <template>\n' +
    '      <context>(prov:activity|prov:agent|prov:softwareAgent)</context>\n' +
    '      <vars>\n' +
    '        <var>\n' +
    '          <name>id</name>\n' +
    '          <val>sem:iri(@prov:id)</val>\n' +
    '        </var>\n' +
    '        <var>\n' +
    '          <name>rdfType</name>\n' +
    '          <val>sem:iri("http://www.w3.org/ns/prov#" || fn:substring(fn:upper-case(fn:local-name()), 1, 1) || fn:substring(fn:local-name(), 2))</val>\n' +
    '        </var>\n' +
    '      </vars>' +
    '      <triples>' +
    '        <triple>\n' +
    '          <subject>\n' +
    '            <val>$id</val>\n' +
    '          </subject>\n' +
    '          <predicate>\n' +
    '            <val>sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")</val>\n' +
    '          </predicate>\n' +
    '          <object>\n' +
    '            <val>$rdfType</val>\n' +
    '          </object>\n' +
    '        </triple>\n' +
    '      </triples>' +
    '      <templates>\n' +
    '        <template>\n' +
    '          <context>prov:startTime</context>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/ns/prov#startedAtTime")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>fn:string(.)</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '        <template>\n' +
    '          <context>prov:endTime</context>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/ns/prov#endedAtTime")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>fn:string(.)</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '        <template>\n' +
    '          <context>prov:type</context>\n' +
    '          <vars>\n' +
    '            <var>\n' +
    '              <name>obj</name>\n' +
    '              <val>sem:QName-to-iri(fn:resolve-QName(string(.),.))</val>\n' +
    '            </var>\n' +
    '          </vars>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>$obj</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '        <template>\n' +
    '          <context>*[fn:namespace-uri(.) != "http://www.w3.org/ns/prov#"]</context>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri(fn:namespace-uri(.)||fn:local-name(.))</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>xs:string(string(.))</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '      </templates>\n' +
    '    </template>\n' +
    '    <template>\n' +
    '      <context>prov:entity</context>\n' +
    '      <vars>\n' +
    '        <var>\n' +
    '          <name>id</name>\n' +
    '          <val>sem:iri(@prov:id)</val>\n' +
    '        </var>\n' +
    '        <var>\n' +
    '          <name>rdfType</name>\n' +
    '          <val>sem:iri("http://www.w3.org/ns/prov#Entity")</val>\n' +
    '        </var>\n' +
    '      </vars>' +
    '      <triples>' +
    '        <triple>\n' +
    '          <subject>\n' +
    '            <val>$id</val>\n' +
    '          </subject>\n' +
    '          <predicate>\n' +
    '            <val>sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")</val>\n' +
    '          </predicate>\n' +
    '          <object>\n' +
    '            <val>$rdfType</val>\n' +
    '          </object>\n' +
    '        </triple>\n' +
    '      </triples>' +
    '    </template>\n' +
    '    <template>\n' +
    '      <context>prov:used</context>\n' +
    '      <triples>\n' +
    '        <triple>\n' +
    '          <subject>\n' +
    '            <val>sem:iri(prov:activity/@prov:ref)</val>\n' +
    '          </subject>\n' +
    '          <predicate>\n' +
    '            <val>sem:iri("http://www.w3.org/ns/prov#used")</val>\n' +
    '          </predicate>\n' +
    '          <object>\n' +
    '            <val>sem:iri(prov:entity/@prov:ref)</val>\n' +
    '          </object>\n' +
    '        </triple>\n' +
    '      </triples>\n' +
    '    </template>\n' +
    '    <template>\n' +
    '      <context>prov:*[@prov:id][prov:label]</context>\n' +
    '      <vars>\n' +
    '        <var>\n' +
    '          <name>id</name>\n' +
    '          <val>sem:iri(@prov:id)</val>\n' +
    '        </var>\n' +
    '      </vars>\n' +
    '      <templates>\n' +
    '        <template>\n' +
    '          <context>prov:label</context>\n' +
    '          <vars>\n' +
    '            <var>\n' +
    '              <name>obj</name>\n' +
    '              <val>string(.)</val>\n' +
    '            </var>\n' +
    '          </vars>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/ns/prov#label")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>$obj</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '      </templates>\n' +
    '    </template>\n' +
    '  </templates>\n' +
    '</template>');
  const templateUri = '/hub-template/RecordProvenance.xml';
  const permissions = [
    xdmp.permission('ps-user', 'read'),
    xdmp.permission('ps-internal', 'update'),
    xdmp.permission('data-hub-developer', 'update')
  ];
  const collections = ["hub-template", "http://marklogic.com/xdmp/tde"];

  hubUtils.writeDocument(templateUri, recordProvenanceTemplate, permissions, collections, config.STAGINGSCHEMASDATABASE);
  hubUtils.writeDocument(templateUri, recordProvenanceTemplate, permissions, collections, config.FINALSCHEMASDATABASE);
}

// BEGIN document specific PROV queries
function provIRIsToCtsQuery(provIRIs) {
  return cts.elementAttributeValueQuery(Sequence.from([fn.QName("http://www.w3.org/ns/prov#", "activity"),fn.QName("http://www.w3.org/ns/prov#", "entity")]), fn.QName("http://www.w3.org/ns/prov#", "id"), provIRIs.map((id) => String(id)));
}

/* allAssociatedProvEntities returns all the associated provenance IDs and the generation time
 * given a document URI across databases.
 */
function allAssociatedProvEntities(documentURI, database = config.FINALDATABASE) {
  // Query is used to get PROV information from the document URI.
  const documentUriSparql = `PREFIX prov:<http://www.w3.org/ns/prov#>
    PREFIX xs:<http://www.w3.org/2001/XMLSchema>

    SELECT DISTINCT * WHERE {
      # Using a union of two SELECT statements to get ancestor and self. The * transitive causes a binding error.
      {
        # SELECT statement to return self information about document URI
        SELECT ?ancestorOrSelfProvID ?generatedAtTime ?activityID WHERE {
          $provID <documentURI> $documentURI;
                    prov:generatedAtTime ?generatedAtTime;
                prov:wasGeneratedBy ?activityID.
          BIND($provID AS ?ancestorOrSelfProvID)
        }
      } UNION {
        # SELECT statement to return ancestor/derivedFrom information about document URI
        SELECT ?ancestorOrSelfProvID ?generatedAtTime ?activityID WHERE {
          $provID <documentURI> $documentURI;
                  # Using + transitive instead of * transitive to avoid binding error
                  prov:wasDerivedFrom+ ?ancestorOrSelfProvID.
          OPTIONAL {
            ?ancestorOrSelfProvID prov:generatedAtTime ?generatedAtTime.
          }
          OPTIONAL {
            ?ancestorOrSelfProvID prov:wasGeneratedBy ?activityID.
          }
        }
      }
    }
    ORDER BY DESC(?generatedAtTime)`;
  // This query is for the case where the initial query is done in the FINAL DB and we need to gather additional information from staging
  const provIdQuery = `PREFIX prov:<http://www.w3.org/ns/prov#>
    PREFIX xs:<http://www.w3.org/2001/XMLSchema>

    SELECT DISTINCT * WHERE {
      # Using a union of two SELECT statements to get ancestor and self. The * transitive causes a binding error.
      {
        # SELECT statement to return self information about document URI
        SELECT ?ancestorOrSelfProvID ?generatedAtTime ?activityID WHERE {
          $provID prov:generatedAtTime ?generatedAtTime;
                prov:wasGeneratedBy ?activityID.
          BIND($provID AS ?ancestorOrSelfProvID)
        }
      } UNION {
        # SELECT statement to return ancestor/derivedFrom information about document URI
        SELECT ?ancestorOrSelfProvID ?generatedAtTime ?activityID WHERE {
          # Using + transitive instead of * transitive to avoid binding error
          $provID prov:wasDerivedFrom+ ?ancestorOrSelfProvID.
          OPTIONAL {
            ?ancestorOrSelfProvID prov:generatedAtTime ?generatedAtTime.
          }
          OPTIONAL {
            ?ancestorOrSelfProvID prov:wasGeneratedBy ?activityID.
          }
        }
      }
    }
    ORDER BY DESC(?generatedAtTime)`;
  const ancestorOrSelfProvIDs = [];
  const retrieveProvEntities = function() {
    const currentDatabase = xdmp.databaseName(xdmp.database());
    const isInitialQuery = database === config.STAGINGDATABASE || currentDatabase === config.FINALDATABASE;
    if (isInitialQuery) {
      const bindings = { documentURI };
      return sem.sparql(documentUriSparql, bindings);
    } else {
      return sem.sparql(provIdQuery, null, null, provIRIsToCtsQuery(ancestorOrSelfProvIDs));
    }
  };
  let finalProvEntities = null;
  const currentDatabase = xdmp.databaseName(xdmp.database());
  if (database === config.FINALDATABASE) {
    finalProvEntities = config.FINALDATABASE === currentDatabase ? retrieveProvEntities(): hubUtils.invokeFunction(retrieveProvEntities, config.FINALDATABASE);
    for (let finalProvEntity of finalProvEntities) {
      ancestorOrSelfProvIDs.push(finalProvEntity.ancestorOrSelfProvID);
      if (finalProvEntity.activityID && !ancestorOrSelfProvIDs.includes(finalProvEntity.activityID)) {
        ancestorOrSelfProvIDs.push(finalProvEntity.activityID);
      }
    }
  }
  let stagingProvEntities = null;
  stagingProvEntities = config.STAGINGDATABASE === currentDatabase ? retrieveProvEntities(): hubUtils.invokeFunction(retrieveProvEntities, config.STAGINGDATABASE);
  for (let stagingProvEntity of stagingProvEntities) {
    if (!ancestorOrSelfProvIDs.includes(stagingProvEntity.ancestorOrSelfProvID)) {
      ancestorOrSelfProvIDs.push(stagingProvEntity.ancestorOrSelfProvID);
    }
    if (stagingProvEntity.activityID && !ancestorOrSelfProvIDs.includes(stagingProvEntity.activityID)) {
      ancestorOrSelfProvIDs.push(stagingProvEntity.activityID);
    }
  }
  return ancestorOrSelfProvIDs;
};

function sourceInformationForDocument(documentURI, database = config.FINALDATABASE) {
  const allAssociatedProvIDs = allAssociatedProvEntities(documentURI, database);
  const sparql = `PREFIX prov:<http://www.w3.org/ns/prov#>
  SELECT ?dataSourceName ?dataSourceType WHERE {
    $provID a prov:Entity;
              <dataSourceName> ?dataSourceName;
              <dataSourceType> ?dataSourceType.
  }`;
  const currentDatabase = xdmp.databaseName(xdmp.database());
  const sparqlFun = function() { return sem.sparql(sparql, { provID: allAssociatedProvIDs}) };
  let sourceInformation = config.STAGINGDATABASE === currentDatabase ? sparqlFun(): hubUtils.invokeFunction(sparqlFun, config.STAGINGDATABASE);
  return sourceInformation.toArray();
}

/* This function provides an abstraction for retrieving information about a document URI across databases and requires SPARQL that has
*   has a provID variable that is bound to.
* */
function runCrossDatabaseSparqlForDocumentURI(sparql, documentURI, database = config.FINALDATABASE) {
  const allAssociatedProvIDs = allAssociatedProvEntities(documentURI, database);
  const sparqlFun = function() { return sem.sparql(sparql, null, null, provIRIsToCtsQuery(allAssociatedProvIDs.map((id) => String(id)))); };
  const currentDatabase = xdmp.databaseName(xdmp.database());
  let stagingResults = config.STAGINGDATABASE === currentDatabase ? sparqlFun(): hubUtils.invokeFunction(sparqlFun, config.STAGINGDATABASE);
  let finalResults = null;
  if (database === config.FINALDATABASE) {
    finalResults = config.FINALDATABASE === currentDatabase ? sparqlFun(): hubUtils.invokeFunction(sparqlFun, config.FINALDATABASE);
  }
  return Sequence.from([
    finalResults,
    stagingResults
  ]).toArray();
}

function stepsRunAgainstDocument(documentURI, database = config.FINALDATABASE) {
  const sparql = `PREFIX prov:<http://www.w3.org/ns/prov#>
  SELECT DISTINCT ?stepName WHERE {
    $provID <stepName> ?stepName;
            prov:wasGeneratedBy ?activityID.
    ?activityID prov:startedAtTime ?activityStartTime.
  }
  ORDER BY DESC(?activityStartTime)`;
  return runCrossDatabaseSparqlForDocumentURI(sparql, documentURI, database);
}

function derivedFromDocuments(documentURI, database = config.FINALDATABASE) {
  const sparql = `PREFIX prov:<http://www.w3.org/ns/prov#>
  SELECT ?derivedFromDocument ?database ?generatedAtTime WHERE {
    $provID <documentURI> ?derivedFromDocument.
    $provID <database> ?database.
    $provID prov:generatedAtTime ?generatedAtTime.
  }
  ORDER BY DESC(?generatedAtTime) ?derivedFromDocument`;
  return runCrossDatabaseSparqlForDocumentURI(sparql, documentURI, database);
}

function documentActivities(documentURI, database = config.FINALDATABASE) {
  const sparql = `PREFIX prov:<http://www.w3.org/ns/prov#>
  SELECT DISTINCT ?activityID ?activityLabel ?activityStartTime ?activityEndTime WHERE {
    $provID a prov:Entity;
              prov:wasGeneratedBy ?activityID.
    ?activityID prov:label ?activityLabel;
                prov:startedAtTime ?activityStartTime;
                prov:endedAtTime ?activityEndTime.
  }
  ORDER BY DESC(?activityStartTime)`;
  return runCrossDatabaseSparqlForDocumentURI(sparql, documentURI, database);
}

module.exports = {
  deleteProvenance: module.amp(deleteProvenance),
  installProvTemplates,
  allAssociatedProvEntities,
  sourceInformationForDocument,
  stepsRunAgainstDocument,
  derivedFromDocuments,
  documentActivities
};
