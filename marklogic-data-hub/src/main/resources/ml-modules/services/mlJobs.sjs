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
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const jobsMod = require("/data-hub/5/impl/jobs.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let flowNames = params["flowNames"];
  let latest = params["latest"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(status)) {
    httpUtils.throwBadRequestWithArray(["Bad Request", "Invalid request"]);
  }
  else if(fn.exists(jobId)) {
    resp = datahub.jobs.getJobDocWithId(jobId);
  }
  else if(fn.exists(status)) {
    resp = datahub.jobs.getJobDocs(status);
  }
  else if (fn.exists(latest)) {
    flowNames = (fn.exists(flowNames)) ? datahub.hubUtils.normalizeToSequence(flowNames) : datahub.hubUtils.normalizeToSequence(flow);
    if (fn.empty(flowNames)) {
      resp = datahub.jobs.getLatestJobDocPerFlow();
    } else {
      resp = datahub.jobs.getLatestJobDocPerFlow(flowNames);
    }
    if (fn.count(flowNames) === 1) {
      resp = resp[0];
    }
  }
  else if (fn.exists(flowNames)) {
    resp = datahub.jobs.getJobDocsForFlows(flowNames);
  }
  else if (fn.exists(flow)) {
    resp = datahub.jobs.getJobDocsByFlow(flow);
  }
  else{
    httpUtils.throwBadRequestWithArray(["Bad Request", "Incorrect options"]);
  }

  return resp;
};


function post(context, params, input) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let step = params["step"];
  let lastCompleted = params["lastCompleted"];
  let stepResponse = input.toObject();
  let resp = null;
  try {
    resp = jobsMod.updateJob(datahub, jobId, status, flow, step, lastCompleted, stepResponse);
  }
  catch (ex) {
    httpUtils.throwBadRequestWithArray(["Bad Request", ex.message]);
  }
  return resp;
};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
