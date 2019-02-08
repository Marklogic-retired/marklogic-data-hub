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
const jobslib = require("/data-hub/5/impl/jobs.sjs");


function get(context, params) {
  let jobId = params["jobid"];
  let status = params["status"];

  let resp = null;

  if(fn.exists(jobId) && fn.exists(status)) {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request"]));
  }
  else if(fn.exists(jobId)) {
    resp = jobslib.getJobDocWithId(jobId);
  }
  else if(fn.exists(status)) {
    resp = jobslib.getJobDocs(status);
  }
  else{
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Incorrect options"]));
  }
  if(fn.empty(resp)){
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([404, "Not Found", "No job document found"]));
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
