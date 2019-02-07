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

const config = require("/com.marklogic.hub/config.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");


function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];
  let step = params["step"];
  let batchId = params["batchid"];

  let resp = null;

  if(fn.exists(jobId) && !fn.exists(status) && !fn.exists(step) && !fn.exists(batchId)) {
    if (jobs.getJobDocWithId(jobId)){
      resp = jobs.getJobStatusRest(jobId);
    }
    else{
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Job not found"]));
    }
  }
  else if(!fn.exists(jobId) && fn.exists(status) && !fn.exists(step) && !fn.exists(batchId)) {
    resp = jobs.getJobsStatus(status);
  }
  else if(fn.exists(jobId) && !fn.exists(status) && fn.exists(batchId)) {
    if ( ! (jobs.getJobDocWithId(jobId) && jobs.getBatchDoc(batchId))){
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Job or Batch not found"]));
    }
    if(fn.exists(step)){
      resp = jobs.getBatchStatus(jobId, batchId, step);
    }
    else{
      resp = jobs.getBatchUris(jobId, batchId);
    }
  }
  else{
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
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
