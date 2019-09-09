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
'use strict';
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");

function get(context, params) {}

function post(context, params, input) {
  let inputOptions = input ? input.toObject() : {};
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!inputOptions.performanceMetrics
  });
  let flowName = 'manual-merge-mastering';
  let stepNumber = 1;
  let refFlowName = params.flowName;
  let refStepNumber = params.step || '1';
  let flow = datahub.flow.getFlow(refFlowName);
  let stepRef = flow.steps[refStepNumber];
  let stepDetails = datahub.flow.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
  // build combined options
  let flowOptions = flow.options || {};
  let stepRefOptions = stepRef.options || {};
  let stepDetailsOptions = stepDetails.options || {};
  let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, inputOptions, params);
  let sourceDatabase = combinedOptions.sourceDatabase || datahub.flow.globalContext.sourceDatabase;

  combinedOptions.fullOutput = true;
  combinedOptions.noWrite = params.preview === 'true';
  combinedOptions.acceptsBatch = true;
  let jobId = params["job-id"];
  let uris = datahub.hubUtils.normalizeToArray(params.uri);
  let query = cts.documentQuery(uris);
  let content = datahub.hubUtils.queryToContentDescriptorArray(query, combinedOptions, sourceDatabase);
  let results = datahub.flow.runFlow(flowName, jobId, content, combinedOptions, stepNumber);
  return {
    'success': results.errorCount === 0,
    'errors': results.errors,
    'mergedURIs': uris,
    'mergedDocument': results.documents.filter((doc) => !uris.includes(doc.uri))[0]
  };
}

function put(context, params, input) {
}

function deleteFunction(context, params) {
  let flowName = 'unmerge-mastering';
  let stepNumber = 1;
  let options = Object.assign({}, params);
  options.fullOutput = true;
  options.noWrite = true;
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!options.performanceMetrics
  });
  let jobId = params["job-id"];
  // build combined options
  let sourceDatabase = options.sourceDatabase || datahub.flow.globalContext.sourceDatabase;
  let mergeURIs = datahub.hubUtils.normalizeToArray(params.mergeURI);
  let query = cts.documentQuery(mergeURIs);
  let content = datahub.hubUtils.queryToContentDescriptorArray(query, options, sourceDatabase);
  let results = datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
  return {
    'success': results.errorCount === 0,
    'errors': results.errors,
    'mergeURIs': mergeURIs,
    'documentsRestored': results.documents.map((doc) => doc.uri).filter((uri) => !mergeURIs.includes(uri))
  };
}

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
