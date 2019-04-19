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
const DataHub = require("/data-hub/5/datahub.sjs");

function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let flowName = params["flow-name"];
  let stepNumber = params.step;
  if (!fn.exists(flowName)) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([400, "Bad Request", "Invalid request - must specify a flowName"]));
  } else {
    let options = params["options"] ? JSON.parse(params["options"]) : {};
    const datahub = new DataHub({ performanceMetrics: !!options.performanceMetrics });
    let jobId = params["job-id"];
    let flow = datahub.flow.getFlow(flowName);
    let stepRef = flow.steps[stepNumber];
    let stepDetails = datahub.flow.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
    let flowOptions = flow.options || {};
    let stepRefOptions = stepRef.options || {};
    let stepDetailsOptions = stepDetails.options || {};
    // build combined options
    let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, options);
    let sourceDatabase = combinedOptions.sourceDatabase || datahub.flow.globalContext.sourceDatabase;
    let query = null;
    let uris = null;
    if (params.uri || options.uris) {
      uris = datahub.hubUtils.normalizeToArray(params.uri || options.uris);
      query = cts.documentQuery(uris);
    } else {
      let sourceQuery = combinedOptions.sourceQuery || flow.sourceQuery;
      query = sourceQuery ? cts.query(sourceQuery) : null;
    }
    let content = [];
    if (!query && input && fn.count(input) === uris.length) {
      content = datahub.hubUtils.normalizeToArray(input).map((inputDoc, i) => { return { uri: uris[i],  value: inputDoc }; });
    } else {
      datahub.hubUtils.queryLatest(function () {
        let results = cts.search(query, cts.indexOrder(cts.uriReference()));
        for (let doc of results) {
          content.push({
            uri: xdmp.nodeUri(doc),
            value: doc,
            context: {
              permissions: combinedOptions.permissions ? datahub.hubUtils.parsePermissions(combinedOptions.permissions) : xdmp.nodePermissions(doc),
              metadata: xdmp.nodeMetadata(doc)
            }
          });
        }
      }, sourceDatabase);
    }
    return datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
  }
}

function put(context, params, input) {
}

function deleteFunction(context, params) {
}

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
