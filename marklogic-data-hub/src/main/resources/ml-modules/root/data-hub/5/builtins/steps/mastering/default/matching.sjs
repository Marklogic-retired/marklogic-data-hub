/**
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
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const quickStartRequiredOptionProperty = 'matchOptions';
const hubCentralRequiredOptionProperty = 'matchRulesets';
const emptySequence = Sequence.from([]);
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

/**
 * Filters out content that has either already been processed by the running Job or are side-car documents not intended for matching against
 * @param {Sequence} content Sequnce of content objects to match
 * @param {string} summaryCollection
 * @param {{contentCollection: string, mergedCollection: string, notificationCollection: string, archivedCollection: string, auditingCollection: string}} collectionInfo
 */
function filterContentAlreadyProcessed(content, summaryCollection, collectionInfo) {
  const jobID = datahub.flow.globalContext.jobId;
  const filteredContent = [];
  const collectionQuery = cts.collectionQuery(summaryCollection);
  const jobIdQuery = cts.fieldWordQuery('datahubCreatedByJob', jobID);
  let auditingNotificationsInSourceQuery = false;
  for (let item of content) {
    const collections = item.context ? item.context.collections || [] : [];
    const auditingOrNotificationDoc = collections.includes(collectionInfo.notificationCollection) || collections.includes(collectionInfo.auditingCollection);
    if (!(cts.exists(cts.andQuery([collectionQuery,jobIdQuery,cts.jsonPropertyValueQuery('uris', item.uri, 'exact')])) ||
        auditingOrNotificationDoc
    )) {
      filteredContent.push(item);
    }
    auditingNotificationsInSourceQuery = auditingNotificationsInSourceQuery || auditingOrNotificationDoc;
  }
  if (auditingNotificationsInSourceQuery) {
    xdmp.log('Mastering auditing and notification documents are included in your source query. For better performance, exclude them from your query.', 'notice');
  }
  return Sequence.from(filteredContent);
}

function main(content, options) {
  if (options.stepId) {
    const stepDoc = fn.head(cts.search(cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/steps"),
      cts.jsonPropertyValueQuery("stepId", options.stepId, "case-insensitive")
    ])));
    if (stepDoc) {
      options = stepDoc.toObject();
    } else {
      httpUtils.throwBadRequestWithArray([`Could not find step with stepId ${options.stepId}`]);
    }
  }
  const collectionInfo = masteringStepLib.checkOptions(null, options, null, [[quickStartRequiredOptionProperty,hubCentralRequiredOptionProperty]]);
  const collections = ['datahubMasteringMatchSummary'];
  let targetEntityType = options.targetEntity || options.targetEntityType;
  if (targetEntityType) {
    collections.push(`datahubMasteringMatchSummary-${targetEntityType}`);
  }
  const summaryCollection = collections[collections.length - 1];
  const filteredContent = filterContentAlreadyProcessed(content, summaryCollection, collectionInfo);
  if (fn.count(filteredContent) === 0) {
    return emptySequence;
  }
  let matchSummaryJson = mastering.buildMatchSummary(
    filteredContent,
    options,
    options.filterQuery ? cts.query(options.filterQuery) : cts.trueQuery(),
    datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL || options.provenanceGranularityLevel === datahub.prov.FINE_LEVEL
  );

  return buildResult(matchSummaryJson, options, collections);
}

function buildResult(matchSummaryJson, options, collections) {
  let result = {
    uri: `/datahub/5/mastering/match-summary/${sem.uuidString()}.json`,
    value: matchSummaryJson,
    context: {
      collections
    }
  };

  if (options.permissions) {
    result.context.permissions = datahub.hubUtils.parsePermissions(options.permissions);
    result.context.permissions = result.context.permissions.concat(xdmp.defaultPermissions());
  }

  return result;
}

module.exports = {
  main,
  buildResult,
  filterContentAlreadyProcessed
};
