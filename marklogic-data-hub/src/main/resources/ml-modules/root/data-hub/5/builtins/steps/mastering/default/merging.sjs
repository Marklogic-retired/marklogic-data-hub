/**
 Copyright 2012-2019 MarkLogic Corporation

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
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringMainStep = require("/data-hub/5/builtins/steps/mastering/default/main.sjs");
const requiredOptionProperties = ['mergeOptions'];
const emptySequence = Sequence.from([]);
const processedURIs = [];

function main(content, options) {
  // These index references can't be out this function scope or the jobReport will error, since they don't exist for the jobs DB
  const jobID = datahub.flow.globalContext.jobId;
  const urisPathReference = cts.pathReference('/matchSummary/URIsToActOn', ['type=string','collation=http://marklogic.com/collation/']);
  const datahubCreatedOnRef = cts.fieldReference('datahubCreatedOn', ['type=dateTime']);
  let uriToTakeActionOn = content.uri;
  masteringMainStep.checkOptions(null, options, null, requiredOptionProperties);
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchSummaryCollection = `datahubMasteringMatchSummary${options.targetEntity ? `-${options.targetEntity}`:''}`;
  let relatedMatchSummaries = cts.search(
    cts.andQuery([
      cts.rangeQuery(urisPathReference, '=', uriToTakeActionOn),
      cts.collectionQuery(matchSummaryCollection)
    ]),
    [cts.indexOrder(datahubCreatedOnRef, 'descending')]
  );
  let matchSummaryJson = fn.head(relatedMatchSummaries).toObject();
  let results = mastering.buildContentObjectsFromMatchSummary(
    uriToTakeActionOn,
    matchSummaryJson,
    {},
    mergeOptions,
    datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL
  );
  processedURIs.push(uriToTakeActionOn);
  for (let matchSummary of relatedMatchSummaries) {
    let URIsToActOn = matchSummary.toObject().matchSummary.URIsToActOn;
    let allURIsProcessed = URIsToActOn.every((uri) => processedURIs.includes(uri) || cts.exists(cts.andQuery([
      cts.documentQuery(uri),
      cts.fieldWordQuery('datahubCreatedByJob', jobID)
    ])));
    if (allURIsProcessed) {
      results.push({
        uri: xdmp.nodeUri(matchSummary),
        '$delete': true
      });
    }
  }
  return results;
}

function jobReport(jobID, stepResponse, options) {
  return masteringMainStep.jobReport(jobID, stepResponse, options, requiredOptionProperties);
}

module.exports = {
  main,
  jobReport
};
