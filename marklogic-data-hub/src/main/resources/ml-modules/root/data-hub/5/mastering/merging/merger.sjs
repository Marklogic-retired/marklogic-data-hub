'use strict';
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const {ThresholdDefinition} = require("/data-hub/5/mastering/matching/matchable.sjs")
const consts = require("../../impl/consts.sjs");
const {buildActionDetails} = require("../matching/matchable.sjs");
const mergingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING_DEBUG);
const mergingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING) || mergingDebugTraceEnabled;
const mergingTraceEvent = xdmp.traceEnabled(consts.TRACE_MERGING) ? consts.TRACE_MERGING : consts.TRACE_MERGING_DEBUG;
const contentObjectsByURI = {};

function populateContentObjects(uris, matchSummary) {
  const allActionDetails = matchSummary.matchSummary.actionDetails;
  const allURIs = [];
  for (const uri of uris) {
    allURIs.push(uri);
    if (allActionDetails[uri]) {
      allURIs.concat(allActionDetails[uri].uris);
    }
  }
  for (const doc of fn.doc(allURIs)) {
    populateContentObject(doc);
  }
}

function addMemoryContentObjects(contentObjects) {
  if (contentObjects) {
    if (mergingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MERGING_DEBUG, `Adding in-memory content objects: ${xdmp.toJsonString(contentObjects)}`);
    }
    for (const contentObj of contentObjects) {
      contentObjectsByURI[contentObj.uri] = contentObj;
    }
    if (mergingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MERGING_DEBUG, `Cached content objects: ${xdmp.toJsonString(contentObjectsByURI)}`);
    }
  }
}

function populateContentObject(doc, uri = xdmp.nodeUri(doc)) {
  if (doc && !contentObjectsByURI[uri]) {
    contentObjectsByURI[uri] = {
      uri,
      value: doc,
      context: {
        collections: xdmp.nodeCollections(doc),
        permissions: xdmp.nodePermissions(doc),
        metadata: xdmp.nodeMetadata(doc)
      }
    };
  }
}

function getContentObject(uri) {
  if (!contentObjectsByURI[uri]) {
    populateContentObject(cts.doc(uri), uri);
  }
  return contentObjectsByURI[uri];
}

function consolidateContextValues(contentObjects, contextPropertyName) {
  return contentObjects
    .map(contentObj => contentObj.context[contextPropertyName])
    .reduce((flat, arr) => flat.concat(arr),[])
    .filter((val, index, arr) => index === arr.indexOf(val));
}

function buildContentObjectsFromMatchSummary(
  uris,
  matchSummary,
  mergeable,
  fineGrainProvenanceIsOn = false
) {
  if (mergingTraceEnabled) {
    xdmp.trace(mergingTraceEvent, `Building merge document with mergeable: ${xdmp.toJsonString(mergeable.mergeStep)} and URIs: ${xdmp.toJsonString(uris)}`);
  }
  // Add any in-memory content objects
  addMemoryContentObjects(mergeable.memoryContent);

  // Optimize with one search query to get the majority of content objects
  populateContentObjects(uris, matchSummary);
  const contentObjects = [];
  const allActionDetails = matchSummary.matchSummary.actionDetails;
  addHashMatchesToMatchSummary(matchSummary, uris);
  for (const uri of uris) {
    const uriActionDetails = allActionDetails[uri] || { action: "no-action" };
    const actionType = uriActionDetails.action;
    let currentContentObject = null;
    switch (actionType) {
      case "merge":
        const mergeContentObjects = uriActionDetails.uris.map(uri => getContentObject(uri)).filter(contentObject => contentObject);
        currentContentObject = {
          uri,
          value: mergeable.buildMergeDocument(mergeContentObjects, uri),
          context: {
            collections: consolidateContextValues(mergeContentObjects, "collections"),
            permissions: consolidateContextValues(mergeContentObjects, "permissions")
          }
        }
        for (const contentToArchive of mergeContentObjects) {
          mergeable.applyDocumentContext(contentToArchive, { action: "archive"});
          contentObjects.push(contentToArchive);
        }
        const auditDoc = mergeable.buildAuditDocument(uri, uriActionDetails.uris, "merge");
        mergeable.applyDocumentContext(auditDoc, { action: "audit"});
        contentObjects.push(auditDoc);
        break;
      case "notify":
        const matchStepName = matchSummary.matchSummary.matchStepName;
        const matchStepFlow = matchSummary.matchSummary.matchStepFlow;
        if(uriActionDetails.uris.length > 1) {
          currentContentObject = mergeable.buildNotification(uri, uriActionDetails.threshold, uriActionDetails.query ? cts.query(uriActionDetails.query): uriActionDetails.uris, matchStepName, matchStepFlow);
        }
        break;
      case "custom":
        const customFunction = hubUtils.requireFunction(uriActionDetails.actionModulePath, uriActionDetails.actionModuleFunction);
        const results = customFunction(uri, uriActionDetails.matchResults, this.mergeStep);
        if (fn.exists(results)) {
          contentObjects.concat(hubUtils.normalizeToArray(results));
        }
      case "no-action":
        currentContentObject = getContentObject(uri);
        break;
      default:
    }
    if (currentContentObject) {
      mergeable.applyDocumentContext(currentContentObject, uriActionDetails);
      contentObjects.push(currentContentObject);
    }
  }
  return contentObjects;
}

function  addHashMatchesToMatchSummary(matchSummary, uris) {
  if (matchSummary.matchSummary.useFuzzyMatch) {
    const hashMatchInfo = matchSummary.matchSummary.hashMatchInfo;
    const actionDetails = matchSummary.matchSummary.actionDetails;
    const thresholds = hashMatchInfo.thresholds;
    const matchRulesetScores = hashMatchInfo.matchRulesetScores;
    const results = sem.sparql(`SELECT DISTINCT ?originalUri ?matchingUri ?matchRuleset FROM <http://marklogic.com/data-hub/matching/fuzzy-hashes> WHERE {
          $uri <http://marklogic.com/data-hub/mastering#hasMatchingHash> ?uriHash.
          ?matchingUri <http://marklogic.com/data-hub/mastering#hasMatchingHash> ?uriHash.
          ?uriHash <http://marklogic.com/data-hub/mastering#belongsTo> ?matchRuleset.
          ?originalUri <http://marklogic.com/data-hub/mastering#hasMatchingHash> ?uriHash.
          FILTER (?originalUri != ?matchingUri)
      }`, { uri: Object.keys(contentObjectsByURI) }).toArray().reduce((hashMatches, triple) => {
      let { originalUri, matchingUri, matchRuleset } = triple;
      originalUri = fn.string(originalUri), matchingUri = fn.string(matchingUri), matchRuleset = fn.string(matchRuleset);
      hashMatches[originalUri] = hashMatches[originalUri] || { matches: {} };
      const uriMatches = hashMatches[originalUri];
      uriMatches[matchingUri] = uriMatches[matchingUri] || { matchedRulesets: [] };
      const match = uriMatches[matchingUri];
      match.matchedRulesets.push(matchRuleset);
      return hashMatches;
    }, {});
    for (const matchUri of Object.keys(results)) {
      const matches = results[matchUri];
      const groupByThreshold = {};
      const matchedUris = Object.keys(matches);
      for (const matchedUri of matchedUris) {
        const match = matches[matchedUri];
        if (!(match && match.matchedRulesets)) {
          continue;
        }
        const score = match.matchedRulesets.map(ruleset => matchRulesetScores[ruleset] || 0).reduce((sum, score) => sum + score, 0);
        let currentThreshold = null;
        for (const threshold of thresholds) {
          if (score >= threshold.score) {
            currentThreshold = threshold;
            continue;
          }
          break;
        }
        if (currentThreshold) {
          groupByThreshold[currentThreshold.thresholdName] = groupByThreshold[currentThreshold.thresholdName] || [];
          groupByThreshold[currentThreshold.thresholdName].push(matchedUri);
          if (currentThreshold.action === "merge") {
            const matchedUriIndex = uris.indexOf(matchedUri);
            if (matchedUriIndex >= 0) {
              uris.splice(matchedUriIndex, 1);
            }
          }
        }
      }
      for (const thresholdName of Object.keys(groupByThreshold)) {
        let existingDetails = actionDetails[matchUri];
        const thresholdMatches = groupByThreshold[thresholdName];
        const threshold = thresholds.find(t => t.thresholdName === thresholdName);
        // if action already exists for the uri then add matching URIs and continue
        if (existingDetails && existingDetails.action == threshold.action) {
          existingDetails.uris.push(...thresholdMatches);
          continue;
        }
        // generate details for new action
        let existingActionKey = Object.keys(actionDetails).find((key) => {
          return actionDetails[key].action === threshold.action && actionDetails[key].uris.includes(matchUri);
        });
        if (!existingActionKey) {
          const thresholdDefinition = new ThresholdDefinition(threshold);
          const matchDocSet = hubUtils.queryToContentDescriptorArray(cts.documentQuery([matchUri].concat(thresholdMatches)));
          const action = buildActionDetails(matchDocSet ,thresholdDefinition);
          const actionUri = Object.keys(action)[0];
          if (actionDetails[actionUri]) {
            actionDetails[actionUri].uris.push(...(action[actionUri].uris));
          } else {
            if (threshold.action === "merge") {
              const matchedUriIndex = uris.indexOf(matchUri);
              if (matchedUriIndex >= 0) {
                uris.splice(matchedUriIndex, 1);
              }
            }
            uris.push(actionUri);
            Object.assign(actionDetails, action);
          }
        } else {
          actionDetails[existingActionKey].uris.push(...thresholdMatches);
        }
      }
    }
  }
}

module.exports = {
  buildContentObjectsFromMatchSummary
};
