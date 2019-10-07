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
const mergeImpl = require("/com.marklogic.smart-mastering/survivorship/merging/base.xqy");
const masteringCollections = require("/com.marklogic.smart-mastering/impl/collections.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");
const requiredOptionProperties = ['matchOptions', 'mergeOptions'];
const emptySequence = Sequence.from([]);

function main(content, options) {
  const filteredContent = [];
  checkOptions(content, options, filteredContent);
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  // Data Hub will persist the results for us.
  let persistResults = false;
  if (filteredContent.length) {
    return mastering.processMatchAndMergeWithOptions(
      Sequence.from(filteredContent),
      mergeOptions,
      matchOptions,
      options.filterQuery ? cts.query(options.filterQuery) : cts.trueQuery(),
      persistResults,
      datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL
    );
  } else {
    return emptySequence;
  }
}

function checkOptions(content, options, filteredContent = [], reqOptProperties = requiredOptionProperties) {
  let hasRequiredOptions = reqOptProperties.every((propName) => !!options[propName]);
  if (!hasRequiredOptions) {
    throw new Error(`Missing the following required mastering options: ${xdmp.describe(requiredOptionProperties.filter((propName) => !options[propName]), emptySequence, emptySequence)}`);
  }
  options.matchOptions = options.matchOptions || {};
  options.mergeOptions = options.mergeOptions || {};
  // set the target entity based off of the step options
  options.mergeOptions.targetEntity = options.targetEntity;
  options.matchOptions.targetEntity = options.targetEntity;
  // provide default empty array values for collections to simplify later logic
  options.mergeOptions.collections = Object.assign({"content": [], "archived": [], "merged": [], "notification": [], "auditing": []},options.mergeOptions.collections);
  options.matchOptions.collections = Object.assign({"content": []},options.matchOptions.collections);
  // sanity check the collections set for the match/merge options
  if (options.matchOptions.collections.content.length) {
    options.mergeOptions.collections.content = options.matchOptions.collections.content;
  } else if (options.mergeOptions.collections.content.length) {
    options.matchOptions.collections.content = options.mergeOptions.collections.content;
  }
  const contentCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.content), masteringConsts['CONTENT-COLL']));
  const archivedCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.archived), masteringConsts['ARCHIVED-COLL']));
  const mergedCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.merged), masteringConsts['MERGED-COLL']));
  const notificationCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.notification), masteringConsts['NOTIFICATION-COLL']));
  const auditingCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.auditing), masteringConsts['AUDITING-COLL']));
  let contentHasExpectedContentCollection = true;
  let contentHasTargetEntityCollection = true;
  if (content) {
    let unlockedURIs = mergeImpl.filterOutLockedUris(Sequence.from(content.toArray().map((item) => item.uri))).toArray();
    for (const item of content) {
      let docCollections = item.context.originalCollections || [];
      if (!docCollections.includes(archivedCollection) && unlockedURIs.includes(item.uri)) {
        mergeImpl.lockForUpdate(item.uri);
        item.context.collections = Sequence.from(docCollections);
        filteredContent.push(item);
        contentHasExpectedContentCollection = contentHasExpectedContentCollection && docCollections.includes(contentCollection);
        contentHasTargetEntityCollection = contentHasTargetEntityCollection && docCollections.includes(options.targetEntity);
      }
    }
  }
  if (content && !contentHasExpectedContentCollection) {
    if (contentHasTargetEntityCollection) {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. Using entity collection "${options.targetEntity}" instead. \
      You may need to review your match/merge options`, 'notice');
      options.matchOptions.collections.content.push(options.targetEntity);
      options.mergeOptions.collections.content.push(options.targetEntity);
    } else {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. You may need to review your match/merge options`, 'warning');
    }
  }
  return { archivedCollection, contentCollection, mergedCollection, notificationCollection, auditingCollection };
}

function jobReport(jobID, stepResponse, options, reqOptProperties = requiredOptionProperties) {
  let collectionsInformation = checkOptions(null, options, null, reqOptProperties);
  let jobQuery = cts.fieldWordQuery('datahubCreatedByJob', jobID);
  let mergedQuery = cts.andQuery([
      jobQuery,
      cts.collectionQuery(collectionsInformation.mergedCollection),
      cts.collectionQuery(collectionsInformation.contentCollection)
    ]);
  return {
    jobID,
    jobReportID: sem.uuidString(),
    flowName: stepResponse.flowName,
    stepName: stepResponse.stepName,
    success: stepResponse.success,
    numberOfDocumentsProcessed: stepResponse.totalEvents,
    numberOfDocumentsSuccessfullyProcessed: stepResponse.successfulEvents,
    resultingMerges: {
      count: cts.estimate(mergedQuery),
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.mergedCollection}" AND Collection:"${collectionsInformation.contentCollection}"`
    },
    documentsArchived: {
      count: cts.estimate(cts.andQuery([
        jobQuery,
        cts.collectionQuery(collectionsInformation.archivedCollection)
      ])),
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.archivedCollection}"`
    },
    masterDocuments: {
      count: cts.estimate(cts.andQuery([
        jobQuery,
        cts.collectionQuery(collectionsInformation.contentCollection)
      ])),
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.contentCollection}"`
    },
    notificationDocuments: {
      count: cts.estimate(cts.andQuery([
        jobQuery,
        cts.collectionQuery(collectionsInformation.notificationCollection)
      ])),
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.notificationCollection}"`
    },
    collectionsInformation,
    matchProvenanceQuery: `// Run this against the '${options.targetDatabase || datahub.config.FINALDATABASE}' database with the 'data-hub-admin-role' or other privileged user
    const masteringLib = require('/data-hub/5/builtins/steps/mastering/default/lib.sjs'); 
    
    let mergedQuery = cts.andQuery([
      cts.fieldWordQuery('datahubCreatedByJob', '${jobID}'),
      cts.collectionQuery('${collectionsInformation.mergedCollection}'),
      cts.collectionQuery('${collectionsInformation.contentCollection}')
    ]);
    masteringLib.matchDetailsByMergedQuery(mergedQuery);
    `
  };
}

module.exports = {
  main,
  // export checkOptions for unit test
  checkOptions,
  jobReport
};
