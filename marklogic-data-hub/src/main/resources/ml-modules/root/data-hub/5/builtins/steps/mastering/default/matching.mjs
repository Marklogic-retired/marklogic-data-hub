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
import consts from "/data-hub/5/impl/consts.mjs";
import mastering from "/data-hub/5/mastering/matching/matcher.mjs";
import masteringStepLib from "/data-hub/5/builtins/steps/mastering/default/lib.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import {Matchable} from "/data-hub/5/mastering/matching/matchable.mjs";

const quickStartRequiredOptionProperty = 'matchOptions';
const hubCentralRequiredOptionProperty = 'matchRulesets';
const emptySequence = Sequence.from([]);

/**
 * Filters out content that has either already been processed by the running Job or are side-car documents not intended for matching against
 * @param {Sequence} content Sequnce of content objects to match
 * @param {string} summaryCollection
 * @param {{contentCollection: string, mergedCollection: string, notificationCollection: string, archivedCollection: string, auditingCollection: string}} collectionInfo
 * @param {string} jobId
 */
function filterContentAlreadyProcessed(content, summaryCollection, collectionInfo, jobId) {
  const collectionQuery = cts.collectionQuery(summaryCollection);
  const jobIdQuery = cts.fieldWordQuery('datahubCreatedByJob', jobId);
  const filteredContent = [];
  let auditingNotificationsInSourceQuery = false;
  for (let item of content) {
    const collections = item.context ? item.context.originalCollections || [] : [];
    const auditingOrNotificationDoc = collections.includes(collectionInfo.notificationCollection) || collections.includes(collectionInfo.auditingCollection);
    // skip auditing or notification documents
    if (auditingOrNotificationDoc) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Filtering out notification/auditing document '${item.uri}'.`);
      auditingNotificationsInSourceQuery = auditingNotificationsInSourceQuery || auditingOrNotificationDoc;
      continue;
    }
    // skip documents already set to be merged
    const actionDetailQuery = cts.andQuery([cts.jsonPropertyValueQuery("uris", item.uri, "exact"), cts.jsonPropertyValueQuery("action", "merge", "exact")]);
    const documentQuery = cts.andQuery([collectionQuery, jobIdQuery, cts.jsonPropertyScopeQuery("actionDetails", actionDetailQuery)]);
    if (cts.exists(documentQuery)) {
      let falsePositive = true;
      for (const matchedDoc of cts.search(documentQuery, ["score-zero", "unfaceted"], 0)) {
        if (cts.contains(matchedDoc.xpath("/matchSummary/actionDetails/*"), actionDetailQuery)) {
          falsePositive = false;
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Filtering out document covered in other match summary '${item.uri}'.`);
          break;
        }
      }
      if (!falsePositive) {
        continue;
      }
    }
    filteredContent.push(item);
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
    ]), ["score-zero", "unfaceted"], 0));
    if (stepDoc) {
      options = stepDoc.toObject();
    } else {
      httpUtils.throwBadRequestWithArray([`Could not find step with stepId ${options.stepId}`]);
    }
  }
  const collectionInfo = masteringStepLib.checkOptions(null, options, null, [[quickStartRequiredOptionProperty, hubCentralRequiredOptionProperty]]);
  const collections = ['datahubMasteringMatchSummary'];
  let targetEntityType = options.targetEntity || options.targetEntityType;
  if (targetEntityType) {
    collections.push(`datahubMasteringMatchSummary-${targetEntityType}`);
  }
  const summaryCollection = collections[collections.length - 1];
  const jobId = stepExecutionContext ? stepExecutionContext.jobId : "";
  const filteredContent = filterContentAlreadyProcessed(content, summaryCollection, collectionInfo, jobId);
  if (fn.count(filteredContent) === 0) {
    xdmp.trace(consts.TRACE_MATCHING_DEBUG, `No documents to process.`);
    return emptySequence;
  }
  const matchOptions = options.matchOptions || options;
  matchOptions.targetEntityType = matchOptions.targetEntityType || options.targetEntityType || options.targetEntity;
  matchOptions.stepName = stepExecutionContext && stepExecutionContext["flowStep"] ? stepExecutionContext["flowStep"]["name"] : "";
  let matchSummaryOutput = mastering.buildMatchSummary(
    new Matchable(matchOptions, stepExecutionContext),
    filteredContent
  );
  return [buildResult(matchSummaryOutput[0], options, collections), ...matchSummaryOutput.slice(1)];
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

export default {
  main,
  buildResult,
  filterContentAlreadyProcessed
};
