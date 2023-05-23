import Artifacts from "/data-hub/5/artifacts/core.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import config from "/com.marklogic.hub/config.mjs";
import consts from "/data-hub/5/impl/consts.mjs";
import common from "/data-hub/5/mastering/common.mjs";

const {addMemoryContentObjects, populateContentObjects, getContentObject,  releaseDatabaseNodeFromContentObject, resetPopulatedContent} = common;
const mergingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING_DEBUG);
const mergingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING) || mergingDebugTraceEnabled;
const mergingTraceEvent = xdmp.traceEnabled(consts.TRACE_MERGING) ? consts.TRACE_MERGING : consts.TRACE_MERGING_DEBUG;

function consolidateContextValues(contentObjects, contextPropertyName) {
  return contentObjects
    .map(contentObj => contentObj.context[contextPropertyName])
    .reduce((flat, arr) => flat.concat(arr), [])
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
    const uriActionDetails = allActionDetails[uri] || {action: "no-action"};
    const actionType = uriActionDetails.action;
    let currentContentObject = null;
    switch (actionType) {
    case "merge": {
      const mergeContentObjects = uriActionDetails.uris.map(uri => getContentObject(uri)).filter(contentObject => contentObject);
      currentContentObject = {
        uri,
        value: mergeable.buildMergeDocument(mergeContentObjects, uri),
        context: {
          collections: consolidateContextValues(mergeContentObjects, "collections"),
          permissions: consolidateContextValues(mergeContentObjects, "permissions")
        }
      };
      for (const contentToArchive of mergeContentObjects) {
        mergeable.applyDocumentContext(contentToArchive, {action: "archive"});
        contentObjects.push(contentToArchive);
      }
      const auditDoc = mergeable.buildAuditDocument(uri, uriActionDetails.uris, "merge");
      mergeable.applyDocumentContext(auditDoc, {action: "audit"});
      contentObjects.push(auditDoc);
      break;
    }
    case "notify": {
      const matchStepName = matchSummary.matchSummary.matchStepName;
      const matchStepFlow = matchSummary.matchSummary.matchStepFlow;
      if (uriActionDetails.uris.length > 1) {
        currentContentObject = mergeable.buildNotification(uri, uriActionDetails.threshold, uriActionDetails.query ? cts.query(uriActionDetails.query) : uriActionDetails.uris, matchStepName, matchStepFlow);
      }
      break;
    }
    case "customActions": {
      const customFunction = hubUtils.requireFunction(uriActionDetails.actionModulePath, uriActionDetails.actionModuleFunction);
      const results = customFunction(uri, uriActionDetails.matchResults, this.mergeStep);
      if (fn.exists(results)) {
        contentObjects.concat(hubUtils.normalizeToArray(results));
      }
    }
    // eslint-disable-next-line no-fallthrough
    case "no-action":
      currentContentObject = getContentObject(uri);
      //  release the node to avoid locking
      releaseDatabaseNodeFromContentObject(currentContentObject);
      break;
    default:
    }
    if (currentContentObject) {
      mergeable.applyDocumentContext(currentContentObject, uriActionDetails);
      contentObjects.push(currentContentObject);
    }
  }
  resetPopulatedContent();
  return contentObjects;
}

function manualMerge(context, params, input) {
  let inputOptions = input ? input.toObject() || {} : {};
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!inputOptions.performanceMetrics
  });
  let flowName = 'manual-merge-mastering';
  let stepNumber = 1;
  let refFlowName = params.flowName;
  let flow = Artifacts.getFullFlow(refFlowName);
  // make the first merge step in a flow the default
  let firstMergeStep = Object.keys(flow.steps || {}).find((stepNumber) => flow.steps[stepNumber].stepDefinitionType.toLowerCase() === "merging");
  let refStepNumber = params.step || firstMergeStep || '1';
  let stepRef = flow.steps[refStepNumber] || {stepDefinitionType: ""};
  const isPreview = fn.string(params.preview) === "true";

  let uris = hubUtils.normalizeToArray(params.uri);
  let stepDetails;
  if (!(stepRef.stepDefinitionType.toLowerCase() === "merging" || stepRef.stepDefinitionType.toLowerCase() === "mastering")) {
    let modelInfo = fn.head(cts.doc(uris[0]).xpath('/*:envelope/*:instance/*:info'));
    let otherMergeForEntityType = null;
    if (fn.exists(modelInfo)) {
      const modelTitle = fn.string(modelInfo.xpath("*:title"));
      const modelVersion = fn.string(modelInfo.xpath("*:version"));
      const modelBaseUri = fn.string(modelInfo.xpath("*:baseUri"));
      const entityTypeIri = `${modelBaseUri.endsWith("/") ? modelBaseUri: modelBaseUri + "/"}${modelTitle}-${modelVersion}/${modelTitle}`;
      const mergeStepForEntity = fn.head(cts.search(cts.andQuery([
        cts.collectionQuery("http://marklogic.com/data-hub/steps/merging"),
        cts.jsonPropertyValueQuery("targetEntityType", entityTypeIri)
      ])));
      if (fn.exists(mergeStepForEntity)) {
        otherMergeForEntityType = mergeStepForEntity.toObject();
      }
    }
    if (isPreview || fn.exists(otherMergeForEntityType)) {
      stepRef = {};
      stepDetails = otherMergeForEntityType || {};
    } else {
      httpUtils.throwBadRequest(`The step referenced must be a merging step. Step type: ${stepRef.stepDefinitionType}`);
    }
  } else {
    stepDetails = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType) || {};
  }
  // build combined options
  let flowOptions = flow.options || {};
  let stepRefOptions = stepRef.options || stepRef;
  let stepDetailsOptions = stepDetails.options || stepDetails;
  let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, inputOptions, params);

  combinedOptions.fullOutput = true;
  combinedOptions.writeStepOutput = !isPreview;
  combinedOptions.acceptsBatch = true;
  combinedOptions.disableJobOutput = isPreview;
  let sourceDatabase = combinedOptions.sourceDatabase || config.FINALDATABASE;
  let query = cts.documentQuery(uris);
  let content = hubUtils.queryToContentDescriptorArray(query, combinedOptions, sourceDatabase);

  let jobId = params["job-id"];
  let results = datahub.flow.runFlow(flowName, jobId, content, combinedOptions, stepNumber, stepRef.interceptors);

  return {
    'success': results.errorCount === 0,
    'errors': results.errors,
    'mergedURIs': uris,
    // we are using existence of previousUri here to determine the merged document
    'mergedDocument': results.documents.filter((doc) => doc.uri.startsWith("/com.marklogic.smart-mastering/merged/"))[0]
  };
}

function manualUnmerge(context, params) {
  let flowName = 'unmerge-mastering';
  let stepNumber = 1;
  let options = Object.assign({blockFutureMerges: true, retainAuditTrail: true}, params);
  if (xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'boolean', options.blockFutureMerges)) {
    options.blockFutureMerges = xs.boolean(options.blockFutureMerges);
  }
  if (xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'boolean', options.retainAuditTrail)) {
    options.retainAuditTrail = xs.boolean(options.retainAuditTrail);
  }
  if (!params.mergeURI) {
    httpUtils.throwBadRequestWithArray(['Bad Request', 'At least one URI needs to be passed to unmerge.']);
  }
  options.fullOutput = true;
  options.writeStepOutput = false;
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!options.performanceMetrics
  });
  let jobId = params["job-id"];
  // build combined options
  let sourceDatabase = options.sourceDatabase || config.FINALDATABASE;
  let mergeURIs = hubUtils.normalizeToArray(params.mergeURI);
  if (params.removeURI) {
    options.removeURIs = hubUtils.normalizeToArray(params.removeURI);
  }
  let query = cts.documentQuery(mergeURIs);
  let content = hubUtils.queryToContentDescriptorArray(query, options, sourceDatabase);
  let results = datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
  return {
    'success': results.errorCount === 0,
    'errors': results.errors,
    'mergeURIs': mergeURIs,
    'documentsRestored': results.documents.map((doc) => doc.uri).filter((uri) => !mergeURIs.includes(uri))
  };
}

export default {
  buildContentObjectsFromMatchSummary,
  manualMerge,
  manualUnmerge
};
