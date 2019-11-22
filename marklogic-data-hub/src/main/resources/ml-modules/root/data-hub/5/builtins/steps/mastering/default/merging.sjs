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
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const requiredOptionProperties = ['mergeOptions'];
const processedURIs = [];

function main(content, options) {
  // These index references can't be out this function scope or the jobReport will error, since they don't exist for the jobs DB
  const jobID = datahub.flow.globalContext.jobId;
  const urisPathReference = cts.pathReference('/matchSummary/URIsToProcess', ['type=string','collation=http://marklogic.com/collation/']);
  const datahubCreatedOnRef = cts.fieldReference('datahubCreatedOn', ['type=dateTime']);
  let uriToTakeActionOn = content.uri;
  masteringStepLib.checkOptions(null, options, null, requiredOptionProperties);
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
    mergeOptions,
    datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL
  );
  processedURIs.push(uriToTakeActionOn);
  for (let matchSummary of relatedMatchSummaries) {
    let matchSummaryObj = matchSummary.toObject().matchSummary;
    let URIsToProcess = matchSummaryObj.URIsToProcess;
    // use one cts.uris call per match summary to reduce list cache hits
    let URIsProcessed =  cts.uris(null, null, cts.andQuery([
      cts.documentQuery(URIsToProcess),
      cts.fieldWordQuery('datahubCreatedByJob', jobID)
    ])).toArray();
    let processedInBatch = processedURIs.filter((uri) => URIsToProcess.includes(uri));
    let allURIsProcessed = URIsProcessed.concat(processedInBatch).length === URIsToProcess.length;
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
  if (stepResponse.success && stepResponse.successfulEvents) {
    const hubUtils = datahub.hubUtils;
    const query = options.sourceQuery;
    let urisEval;
    if (!query || /^\s*cts\.(uris|values)\(.*\)\s*$/.test(query)) {
      urisEval = null;
      datahub.debug.log({type: 'notice', message: `Cannot safely parse sourceQuery for match summary cleanup (JobID: ${jobID})`});
    } else {
      // Restrict the query to only cover match summary documents in the query
      urisEval = `cts.uris(null, null, cts.andQuery([cts.collectionQuery('datahubMasteringMatchSummary${options.targetEntity ? '-' + options.targetEntity : ''}'),${query}]))`;
    }
    if (urisEval) {
      const matchSummaryURIs = hubUtils.normalizeToArray(xdmp.eval(urisEval, {options: options}));
      const summariesToDelete = matchSummaryURIs.map((uri) => ({uri, '$delete': true}));
      hubUtils.writeDocuments(summariesToDelete);
    }
  }
  return masteringStepLib.jobReport(jobID, stepResponse, options, requiredOptionProperties);
}

module.exports = {
  main,
  jobReport
};
