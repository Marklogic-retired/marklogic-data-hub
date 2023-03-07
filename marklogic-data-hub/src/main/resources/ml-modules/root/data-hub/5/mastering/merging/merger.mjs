import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import consts from "/data-hub/5/impl/consts.mjs";
import common from "/data-hub/5/mastering/common.mjs";

const {addMemoryContentObjects, populateContentObjects, getContentObject} = common;
const mergingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING_DEBUG);
const mergingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING) || mergingDebugTraceEnabled;
const mergingTraceEvent = xdmp.traceEnabled(consts.TRACE_MERGING) ? consts.TRACE_MERGING : consts.TRACE_MERGING_DEBUG;

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

export default {
    buildContentObjectsFromMatchSummary
};
