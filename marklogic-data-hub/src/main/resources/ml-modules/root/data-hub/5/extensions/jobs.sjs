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
const datahub = new DataHub();

function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(status)) {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request"]));
  }
  else if(fn.exists(jobId)) {
    resp = datahub.jobs.getJobDocWithId(jobId);
  }
  else if(fn.exists(status)) {
    resp = datahub.jobs.getJobDocs(status);
  }
  else if (fn.exists(flow)) {
    resp = datahub.jobs.getJobDocsByFlow(flow);
  }
  else{
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
  }
  if(fn.empty(resp) || resp.length === 0){
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([404, "Not Found", "No job document found"]));
  }
  return resp;
};


function post(context, params, input) {
  let jobId = params["jobid"];
  let status = params["status"];
  let flow = params["flow-name"];
  let step = params["step"];
  let lastCompleted = params["lastCompleted"];
  let stepResponses = params["stepResponses"];

  let resp = null;
  let jobDoc = datahub.jobs.getJobDocWithId(jobId);
  if(jobDoc) {
    jobDoc.job.lastAttemptedStep = step;
    jobDoc.job.jobStatus = status;
    if(lastCompleted) {
      jobDoc.job.lastCompletedStep = lastCompleted;
    }
    if(stepResponses) {
      jobDoc.job.stepResponses = JSON.parse(stepResponses);
    }
    if(status === "finished"|| status === "finished_with_errors" || status === "failed"|| status === "cancelled"|| status === "stop-on-error") {
      jobDoc.job.timeEnded = fn.currentDateTime();
    }

    //Update the job doc
    datahub.hubUtils.writeDocument("/jobs/"+ jobId +".json", jobDoc, "xdmp.defaultPermissions()", ['Jobs','Job'], datahub.config.JOBDATABASE);
  }
  else {
    if(fn.exists(jobId) && fn.exists(flow)) {
      datahub.jobs.createJob(flow, jobId);
    }
    else {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
    }

  }
};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
