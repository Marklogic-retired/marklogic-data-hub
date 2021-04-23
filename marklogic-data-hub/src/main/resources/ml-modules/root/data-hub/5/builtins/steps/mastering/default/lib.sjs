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
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
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
  hubUtils.invokeFunction(
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
    config.JOBDATABASE
  );
  return output;
}

/**
 * @param {null, Sequence} content
 * @param {*} options
 * @param {null, []} filteredContent
 * @param {[string, string]} reqOptProperties
 * @return {{contentCollection: string, mergedCollection: string, notificationCollection: string, archivedCollection: string, auditingCollection: string}} collectionInfo
 */
function checkOptions(content, options, filteredContent = [], reqOptProperties = requiredOptionProperties) {
  let existingRequiredOptions = reqOptProperties.filter((propNames) => {
    if (Array.isArray(propNames)) {
      return true;
    } else {
      return !!options[propNames];
    }
  });
  let hasRequiredOptions = existingRequiredOptions.length === reqOptProperties.length;
  if (!hasRequiredOptions) {
    let missingProperties = reqOptProperties.filter((propNames) => !existingRequiredOptions.includes(propNames));
    throw new Error(`Missing the following required mastering options: ${xdmp.toJsonString(missingProperties)}`);
  }

  const targetEntityType = options.targetEntityType || options.targetEntity;
  options.targetEntityType = targetEntityType;
  if (options.targetEntity) {
    delete options.targetEntity;
  }
  // ensure target entity type gets passed along in both matching/merging options to mastering step
  if (options.mergeOptions) {
    options.mergeOptions.targetEntityType = targetEntityType;
  }
  if (options.matchOptions) {
    options.matchOptions.targetEntityType = targetEntityType;
  }
  setCollectionDefaults(options, targetEntityType);

  let targetCollections = {};
  ['onMerge', 'onNoMatch', 'onArchive', 'onNotification'].forEach((eventName) => {
    targetCollections[eventName] = targetCollections[eventName] || {};
  });
  if (options.mergeOptions) {
    options.mergeOptions.algorithms = options.mergeOptions.algorithms || {};
    options.mergeOptions.algorithms.collections = Object.assign(targetCollections, options.mergeOptions.algorithms.collections);
  } else if (options.mergeRules) {
    options.targetCollections = options.targetCollections || {};
    options.targetCollections = Object.assign(targetCollections, targetCollections);
  }

  const collections = (options.matchOptions || options.mergeOptions || options).collections;
  const contentCollection = fn.head(masteringCollections.getCollections(Sequence.from(collections.content), masteringConsts['CONTENT-COLL']));
  const archivedCollection = fn.head(masteringCollections.getCollections(Sequence.from(collections.archived), masteringConsts['ARCHIVED-COLL']));
  const mergedCollection = fn.head(masteringCollections.getCollections(Sequence.from(collections.merged), masteringConsts['MERGED-COLL']));
  const notificationCollection = fn.head(masteringCollections.getCollections(Sequence.from(collections.notification), masteringConsts['NOTIFICATION-COLL']));
  const auditingCollection = fn.head(masteringCollections.getCollections(Sequence.from(collections.auditing), masteringConsts['AUDITING-COLL']));
  let contentHasExpectedContentCollection = true;
  let contentHasTargetEntityCollection = true;
  if (content) {
    let unlockedURIs = mergeImpl.filterOutLockedUris(Sequence.from(content.toArray().map((item) => item.uri))).toArray();
    for (const item of content) {
      let docCollections = item.context.originalCollections || [];
      if (!(docCollections.includes(archivedCollection) || docCollections.includes(auditingCollection) || docCollections.includes(notificationCollection)) && unlockedURIs.includes(item.uri)) {
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
  if (!options.targetEntityType) {
    if (content && !contentHasExpectedContentCollection) {
      if (contentHasTargetEntityCollection) {
        xdmp.log(`Expected collection "${contentCollection}" not found on content. Using entity collection "${options.targetEntity}" instead. \
        You may need to review your match/merge options`, 'notice');
        optionsRoot.collections.content.push(options.targetEntity);
      } else {
        xdmp.log(`Expected collection "${contentCollection}" not found on content. You may need to review your match/merge options`, 'warning');
      }
    }
  }
  return { archivedCollection, contentCollection, mergedCollection, notificationCollection, auditingCollection };
}

function setCollectionDefaults(options, targetEntityType) {
  const collectionsParent = (options.matchOptions || options.mergeOptions || options);
  // provide default empty array values for collections to simplify later logic
  collectionsParent.collections = Object.assign({"content": [], "archived": [], "merged": [], "notification": [], "auditing": []},collectionsParent.collections);
  if (targetEntityType) {
    if (!(collectionsParent.targetEntity || collectionsParent.targetEntityType)) {
      collectionsParent.targetEntityType = targetEntityType;
    }
    collectionsParent.collections = getCollectionSettings(collectionsParent.collections, targetEntityType);
    if (options.mergeOptions && options.mergeOptions !== collectionsParent) {
      options.mergeOptions.collections = collectionsParent.collections;
    }
  }
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
  const entityTypeTitle = entityType.substring(entityType.lastIndexOf("/") + 1);
  const content = getCollectionSetting(collectionsSettings, "content", ["sm-" + entityTypeTitle + "-mastered"]);
  const merged = getCollectionSetting(collectionsSettings, "merged", ["sm-" + entityTypeTitle + "-merged"]);
  const archived = getCollectionSetting(collectionsSettings, "archived", ["sm-" + entityTypeTitle + "-archived"]);
  const notification = getCollectionSetting(collectionsSettings, "notification", ["sm-" + entityTypeTitle + "-notification"]);
  const auditing = getCollectionSetting(collectionsSettings, "auditing", ["sm-" + entityTypeTitle + "-auditing"]);
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

/**
 * 
 * @param jobID 
 * @param stepResponse 
 * @param options 
 * @param outputContentArray will not be null when connected steps are being run
 * @param reqOptProperties 
 * @returns 
 */
function jobReport(jobID, stepResponse, options, outputContentArray, reqOptProperties = requiredOptionProperties) {
  let collectionsInformation = checkOptions(null, options, null, reqOptProperties);
  let jobQuery = cts.fieldWordQuery('datahubCreatedByJob', jobID);

  const mergedCount = outputContentArray ? 
    getContentInCollectionCount(outputContentArray, collectionsInformation.mergedCollection) : 
    cts.estimate(cts.andQuery([
      jobQuery,
      cts.collectionQuery(collectionsInformation.mergedCollection),
      cts.collectionQuery(collectionsInformation.contentCollection)
    ]));

  const archivedCount = outputContentArray ? 
    getContentInCollectionCount(outputContentArray, collectionsInformation.archivedCollection) : 
    cts.estimate(cts.andQuery([
      jobQuery,
      cts.collectionQuery(collectionsInformation.archivedCollection)
    ]));
  
  const masteredCount = outputContentArray ? 
    getContentInCollectionCount(outputContentArray, collectionsInformation.contentCollection) : 
    cts.estimate(cts.andQuery([
      jobQuery,
      cts.collectionQuery(collectionsInformation.contentCollection)
    ]));
  
  const notificationCount = outputContentArray ? 
    getContentInCollectionCount(outputContentArray, collectionsInformation.notificationCollection) : 
    cts.estimate(cts.andQuery([
      jobQuery,
      cts.collectionQuery(collectionsInformation.notificationCollection)
    ]));
  
  return {
    jobID,
    jobReportID: sem.uuidString(),
    flowName: stepResponse.flowName,
    stepName: stepResponse.stepName,
    success: stepResponse.success,
    numberOfDocumentsProcessed: stepResponse.totalEvents,
    numberOfDocumentsSuccessfullyProcessed: stepResponse.successfulEvents,
    resultingMerges: {
      count: mergedCount,
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.mergedCollection}" AND Collection:"${collectionsInformation.contentCollection}"`
    },
    documentsArchived: {
      count: archivedCount,
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.archivedCollection}"`
    },
    masterDocuments: {
      count: masteredCount,
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.contentCollection}"`
    },
    notificationDocuments: {
      count: notificationCount,
      query: `createdByJob:"${jobID}" AND Collection:"${collectionsInformation.notificationCollection}"`
    },
    collectionsInformation,
    matchProvenanceQuery: `// Run this against the '${options.targetDatabase || config.FINALDATABASE}' database with a privileged user
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

/**
 * Convenience function for getting the count of content objects in the given collection.
 * 
 * @param outputContentArray
 * @param collection 
 * @returns 
 */
function getContentInCollectionCount(outputContentArray, collection) {
  return outputContentArray.filter(content => {
    return content.context && content.context.collections && 
      Array.isArray(content.context.collections) && 
      content.context.collections.includes(collection);
  }).length;
}

module.exports = {
  matchDetailsByMergedQuery,
  expectedCollectionEvents,
  checkOptions,
  jobReport
};
