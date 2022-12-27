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
'use strict';

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const Artifacts = mjsProxy.requireMjsModule("/data-hub/5/artifacts/core.mjs");
const config = mjsProxy.requireMjsModule("/com.marklogic.hub/config.mjs");
const DataHubSingleton = mjsProxy.requireMjsModule("/data-hub/5/datahub-singleton.mjs");
const hubUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/hub-utils.mjs");
const httpUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/http-utils.mjs");

function get(context, params) {}

function post(context, params, input) {
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
  let stepRef = flow.steps[refStepNumber] || {stepDefinitionType: "" };
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
    'mergedDocument': results.documents.filter((doc) => !!doc.previousUri)[0]
  };
}

function put(context, params, input) {
}

function deleteFunction(context, params) {
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

exports.GET = get;
exports.POST =  post;
exports.PUT = put;
exports.DELETE =  deleteFunction;