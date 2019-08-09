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
  // TODO manual merge will go here
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
    'mergeURIs': mergeURIs,
    'documentsRestored': results.documents.map((doc) => doc.uri).filter((uri) => !mergeURIs.includes(uri))
  };
}

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
