/**
 Copyright (c) 2020 MarkLogic Corporation

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
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
/**
 * DO NOT USE THIS; it is deprecated as of DHF 5.3.0.
 *
 * Use the processUris.sjs DS endpoint in StepRunnerService instead.
 */


function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let flowName = params["flow-name"];
  if (!fn.exists(flowName)) {
    httpUtils.throwBadRequestWithArray(["Bad Request", "Invalid request - must specify a flowName"]);
  } else {
    const stepNumber = params.step;
    const options = params["options"] ? JSON.parse(params["options"]) : {};
    const datahub = DataHubSingleton.instance({
      performanceMetrics: !!options.performanceMetrics
    });

    const content = datahub.flow.findMatchingContent(flowName, stepNumber, options, null);
    return datahub.flow.runFlow(flowName, params["job-id"], content, options, stepNumber);
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
