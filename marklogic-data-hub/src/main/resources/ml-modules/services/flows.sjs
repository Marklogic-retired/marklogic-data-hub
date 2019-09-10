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
  let flowName = params["flowName"];
  let namesOnly = params["namesOnly"];

  let resp = null;

  if(fn.exists(flowName) && fn.exists(namesOnly)) {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request - specify flowName or namesOnly"]));
  }
  else if(fn.exists(namesOnly)) {
    resp = datahub.flow.getFlowNames();
  }
  else if(fn.exists(flowName)) {
    resp = datahub.flow.getFlow(flowName);
  }
  else{
    resp = datahub.flow.getFlows();
  }
  if(fn.empty(resp) || resp.length === 0){
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([404, "Not Found", "No flow found"]));
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
