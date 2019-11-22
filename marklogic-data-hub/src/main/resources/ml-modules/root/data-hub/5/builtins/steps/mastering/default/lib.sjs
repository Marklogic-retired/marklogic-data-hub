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
const mergeImpl = require("/com.marklogic.smart-mastering/survivorship/merging/base.xqy");
const masteringCollections = require("/com.marklogic.smart-mastering/impl/collections.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");
const requiredOptionProperties = ['matchOptions', 'mergeOptions'];
const ps = require('/MarkLogic/provenance');
const op = require('/MarkLogic/optic');
const emptySequence = Sequence.from([]);

function matchDetailsByMergedQuery(mergedQuery) {
  let mergedURIs = cts.uris(null, [], mergedQuery);
  let output = {};
  datahub.hubUtils.queryLatest(
    function () {
      for (let docURI of mergedURIs) {
        let match = {
          attributes: {
            destination: docURI
          }
        };
        let out = {
          dateTime: '?',              // date and time record was recorded
          attributes: {'destination': '?', 'matchedDocuments': '?'}
        };
        let kvPattern = ps.opTriplePattern(match, out);
        let result = op.fromTriples(kvPattern).result().toArray()[0];
        output[docURI] = result && result.matchedDocuments  ? xdmp.unquote(result.matchedDocuments) : null;
      }
    },
    datahub.config.JOBDATABASE
  );
  return output;
}

function checkOptions(content, options, filteredContent = [], reqOptProperties = requiredOptionProperties) {
  let hasRequiredOptions = reqOptProperties.every((propName) => !!options[propName]);
  if (!hasRequiredOptions) {
    throw new Error(`Missing the following required mastering options: ${xdmp.describe(requiredOptionProperties.filter((propName) => !options[propName]), emptySequence, emptySequence)}`);
  }
  options.matchOptions = options.matchOptions || {};
  options.mergeOptions = options.mergeOptions || {};
  // provide default empty array values for collections to simplify later logic
  options.mergeOptions.collections = Object.assign({"content": [], "archived": [], "merged": [], "notification": [], "auditing": []},options.mergeOptions.collections);
  options.matchOptions.collections = Object.assign({"content": []},options.matchOptions.collections);
  // sanity check the collections set for the match/merge options
  if (options.matchOptions.collections.content.length) {
    options.mergeOptions.collections.content = options.matchOptions.collections.content;
  } else if (options.mergeOptions.collections.content.length) {
    options.matchOptions.collections.content = options.mergeOptions.collections.content;
  }

  if (options.targetEntity) {
    // set the target entity based off of the step options
    options.mergeOptions.targetEntity = options.targetEntity;
    options.matchOptions.targetEntity = options.targetEntity;
    // Set default collections be entity type
    options.mergeOptions.collections = getCollectionSettings(options.mergeOptions.collections, options.targetEntity);
  }

  if (reqOptProperties.includes('mergeOptions')) {
    options.mergeOptions.algorithms = options.mergeOptions.algorithms || {};
    options.mergeOptions.algorithms.collections = options.mergeOptions.algorithms.collections || {};
    ['onMerge', 'onNoMatch', 'onArchive', 'onNotification'].forEach((eventName) => {
      options.mergeOptions.algorithms.collections[eventName] = options.mergeOptions.algorithms.collections[eventName] || {};
    });
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
        if (filteredContent) {
          filteredContent.push(item);
        }
        contentHasExpectedContentCollection = contentHasExpectedContentCollection && docCollections.includes(contentCollection);
        contentHasTargetEntityCollection = contentHasTargetEntityCollection && docCollections.includes(options.targetEntity);
      }
    }
  }
  // If target entity is set, we match on documents containing an entity instead of a content collection
  if (!options.targetEntity) {
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
  }
  return { archivedCollection, contentCollection, mergedCollection, notificationCollection, auditingCollection };
}

function expectedCollectionEvents(entityType, existingMergeOptions) {
  let collections = existingMergeOptions && existingMergeOptions.collections;
  let collectionSettings = getCollectionSettings(collections, entityType);
  return {
    "onMerge": collectionSettings.content.concat(collectionSettings.merged),
    "onNoMatch": collectionSettings.content,
    "onArchive": collectionSettings.archived,
    "onNotification": collectionSettings.notification,
    "onAuditing": collectionSettings.auditing
  };
}

function getCollectionSettings(collectionsSettings, entityType) {
  let content = getCollectionSetting(collectionsSettings, "content", ["sm-" + entityType + "-mastered"]);
  let merged = getCollectionSetting(collectionsSettings, "merged", ["sm-" + entityType + "-merged"]);
  let archived = getCollectionSetting(collectionsSettings, "archived", ["sm-" + entityType + "-archived"]);
  let notification = getCollectionSetting(collectionsSettings, "notification", ["sm-" + entityType + "-notification"]);
  let auditing = getCollectionSetting(collectionsSettings, "auditing", ["sm-" + entityType + "-auditing"]);
  return {
    content,
    merged,
    archived,
    notification,
    auditing
  };
}


function getCollectionSetting(collectionsSettings, collectionType, defaultCollections) {
  let currentSettings = collectionsSettings && collectionsSettings[collectionType];
  return currentSettings && currentSettings.length ? currentSettings : defaultCollections;
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
    
    let mergedAndNotifiedQuery = cts.andQuery([
      cts.fieldWordQuery('datahubCreatedByJob', '${jobID}'),
      cts.orQuery([
        cts.andQuery([
          cts.collectionQuery('${collectionsInformation.mergedCollection}'),
          cts.collectionQuery('${collectionsInformation.contentCollection}')
        ]),
        cts.collectionQuery('${collectionsInformation.notificationCollection}')
      ])
    ]);
    masteringLib.matchDetailsByMergedQuery(mergedAndNotifiedQuery);
    `
  };
}

module.exports = {
  matchDetailsByMergedQuery,
  expectedCollectionEvents,
  checkOptions,
  jobReport
};
