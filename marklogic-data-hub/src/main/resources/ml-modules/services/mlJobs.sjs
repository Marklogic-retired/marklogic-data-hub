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

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

/**
 * This is still supporting what's documented at https://docs.marklogic.com/datahub/5.4/tools/rest/rest-extensions.html
 * for the mlJobs endpoint, so we still need test cases for them.
 *
 * @param context
 * @param params
 * @returns {null}
 */
function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let flowNames = params["flowNames"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(status)) {
    httpUtils.throwBadRequestWithArray(["Bad Request", "Invalid request"]);
  }
  else if(fn.exists(jobId)) {
    resp = jobs.getJob(jobId);
  }
  else if(fn.exists(status)) {
    resp = jobs.getJobDocs(status);
  }
  else if (fn.exists(flowNames)) {
    resp = jobs.getJobDocsForFlows(flowNames);
  }
  else if (fn.exists(flow)) {
    resp = jobs.getJobDocsByFlow(flow);
  }
  else{
    httpUtils.throwBadRequestWithArray(["Bad Request", "Incorrect options"]);
  }

  return resp;
};


function post(context, params, input) {};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
