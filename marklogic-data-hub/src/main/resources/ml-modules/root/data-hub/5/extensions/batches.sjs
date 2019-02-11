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
const JobsLib = require("/data-hub/5/impl/jobs.sjs");
const jobs = new JobsLib();


function get(context, params) {
  let jobId = params["jobid"];
  let step = params["step"];
  let batchId = params["batchid"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(step) ) {
    resp = jobs.getBatchDocs(jobId, step);
  }
  else if(fn.exists(jobId) && fn.exists(batchId)) {
    resp = jobs.getBatchDoc(jobId, batchId);
  }
  else{
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
  }
  if(fn.empty(resp) || resp.length === 0){
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([404, "Not Found", "No batch document found"]));
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
