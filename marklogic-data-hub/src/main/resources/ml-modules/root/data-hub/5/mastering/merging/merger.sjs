'use strict';
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const consts = require("../../impl/consts.sjs");
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
        const matchStepName = matchSummary["matchSummary"]["matchStepName"];
        const matchStepFlow = matchSummary["matchSummary"]["matchStepFlow"];
        currentContentObject = mergeable.buildNotification(uri, uriActionDetails.threshold, uriActionDetails.query ? cts.query(uriActionDetails.query): uriActionDetails.uris, matchStepName, matchStepFlow);
        break;
      case "custom":
        for (const action of uriActionDetails.actions) {
          const customFunction = hubUtils.requireFunction(action.at, action.function);
          const results = customFunction(uri, action.matchResults, this.mergeStep);
          if (fn.exists(results)) {
            contentObjects.concat(hubUtils.normalizeToArray(results));
          }
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

module.exports = {
  buildContentObjectsFromMatchSummary
};
