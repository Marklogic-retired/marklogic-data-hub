/*
  Copyright (c) 2020 MarkLogic Corporation

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

declareUpdate();

// No privilege required: Use of this is restricted to users who have update permissions on entity instances
// matching the query performed by this endpoint

const config = require("/com.marklogic.hub/config.sjs");

var endpointState;
if (!endpointState) {
  endpointState = {};
} else {
  endpointState = fn.head(xdmp.fromJSON(endpointState));
}

var workUnit = fn.head(xdmp.fromJSON(workUnit));

const batchSize = workUnit.batchSize ? workUnit.batchSize : 50;

const fixedCollection = "datahubCreatedByStep-fixed";

const stepDefinitionNames = fn.collection('http://marklogic.com/data-hub/step-definition')
  .toArray().map(stepDef => stepDef.toObject().name);

const documentQueries = [
  // Have to use a value query so that queries match on names with hyphens in them
  cts.fieldValueQuery("datahubCreatedByStep", stepDefinitionNames),
  cts.notQuery(cts.collectionQuery(fixedCollection))
];

if (endpointState.lastProcessedUri) {
  documentQueries.push(cts.rangeQuery(cts.uriReference(), ">", endpointState.lastProcessedUri));
}

const uris = cts.uris(
  null, ['limit=' + batchSize],
  cts.andQuery(documentQueries), null, [workUnit.forestId]
).toArray();

if (uris.length == 0) {
  null;
} else {
  uris.forEach(uri => {
    const metadata = xdmp.documentGetMetadata(uri);

    const stepDef = fn.head(cts.search(cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/step-definition"),
      cts.jsonPropertyValueQuery("name", metadata.datahubCreatedByStep)
    ])));

    // Rare, but the stepDef may no longer exist, e.g. if it was a custom one
    if (stepDef) {
      const stepDefType = stepDef.toObject().type;

      // Every stepDef should have a type, but in case it doesn't, we can't do anything further
      if (stepDefType) {
        const datahubCreatedByJob = metadata.datahubCreatedByJob;
        if (datahubCreatedByJob) {
          // This can have multiple space-delimited values; we need the most recent one
          const jobIds = datahubCreatedByJob.split(' ');
          const latestJobId = jobIds[jobIds.length - 1];
          const flowName = metadata.datahubCreatedInFlow;
          const stepDefinitionName = stepDef.toObject().name;

          // This is based on the pattern used in prov.sjs
          const subject = latestJobId + flowName + stepDefType.toLowerCase() + uri;

          let stepName = null;
          // Try wasInfluencedBy first; it won't exist for ingestion steps, but there should be only one occurrence of
          // it if it does exist
          // Also - xdmp.eval works, but xdmp.invokeFunction returns no results; not sure why
          const influencedByTriple = fn.head(xdmp.eval("var subject, predicate; cts.triples(subject, predicate, null)",
            {subject: sem.iri(subject), predicate: sem.iri("http://www.w3.org/ns/prov#wasInfluencedBy")},
            {database: xdmp.database(config.JOBDATABASE)}
          ));
          if (influencedByTriple) {
            stepName = sem.tripleObject(influencedByTriple);
          }

          // If no luck with wasInfluencedBy, try wasAssociatedWith
          if (stepName === null) {
            console.log("trying associated");
            const associatedWithTriples = xdmp.eval("var subject, predicate; cts.triples(subject, predicate, null)",
              {subject: sem.iri(subject), predicate: sem.iri("http://www.w3.org/ns/prov#wasAssociatedWith")},
              {database: xdmp.database(config.JOBDATABASE)}
            );
            if (associatedWithTriples) {
              for (var triple of associatedWithTriples) {
                const object = sem.tripleObject(triple);
                if (object != flowName && object != stepDefinitionName) {
                  console.log("Using associatedWith!");
                  stepName = object;
                  break;
                }
              }
            }
          }

          // It is not unusual for triples to not exist, e.g provenance may have been disabled
          if (stepName) {
            xdmp.documentPutMetadata(uri, {datahubCreatedByStep: stepName});
            xdmp.documentAddCollections(uri, fixedCollection);
          }
        }
      }
    }
  });


  endpointState.lastProcessedUri = uris[uris.length - 1];
  Sequence.from([endpointState]);
}
