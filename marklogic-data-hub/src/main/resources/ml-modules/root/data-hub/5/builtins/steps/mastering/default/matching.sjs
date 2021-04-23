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
const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const quickStartRequiredOptionProperty = 'matchOptions';
const hubCentralRequiredOptionProperty = 'matchRulesets';
const emptySequence = Sequence.from([]);
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

/**
 * Filters out content that has either already been processed by the running Job or are side-car documents not intended for matching against
 * @param {Sequence} content Sequnce of content objects to match
 * @param {string} summaryCollection
 * @param {{contentCollection: string, mergedCollection: string, notificationCollection: string, archivedCollection: string, auditingCollection: string}} collectionInfo
 * @param {string} jobId
 */
function filterContentAlreadyProcessed(content, summaryCollection, collectionInfo, jobId) {
  const filteredContent = [];
  const collectionQuery = cts.collectionQuery(summaryCollection);
  const jobIdQuery = cts.fieldWordQuery('datahubCreatedByJob', jobId);
  let auditingNotificationsInSourceQuery = false;
  for (let item of content) {
    const collections = item.context ? item.context.originalCollections || [] : [];
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

function main(content, options, stepExecutionContext) {
  // Hack to allow for a merging step to be able to access the in-memory content objects
  // that this step receives. This matching step only returns a content object for the 
  // match summary that it generates, but the merging step needs access to the content 
  // objects that this step receives.
  if (stepExecutionContext != null && stepExecutionContext.flowExecutionContext != null) {
    stepExecutionContext.flowExecutionContext.matchingStepContentArray = content.toArray();
  }

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
  const jobId = stepExecutionContext ? stepExecutionContext.jobId : "";
  const filteredContent = filterContentAlreadyProcessed(content, summaryCollection, collectionInfo, jobId);
  if (fn.count(filteredContent) === 0) {
    return emptySequence;
  }
  let matchSummaryJson = mastering.buildMatchSummary(
    filteredContent,
    options,
    options.filterQuery ? cts.query(options.filterQuery) : cts.trueQuery(),
    stepExecutionContext != null ? stepExecutionContext.fineProvenanceIsEnabled() : false
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
    result.context.permissions = hubUtils.parsePermissions(options.permissions);
    result.context.permissions = result.context.permissions.concat(xdmp.defaultPermissions());
  }

  return result;
}

module.exports = {
  main,
  buildResult,
  filterContentAlreadyProcessed
};
