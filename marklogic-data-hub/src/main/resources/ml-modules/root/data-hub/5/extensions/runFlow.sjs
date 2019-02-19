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

//todo flush this out
function get(context, params) {
  let flowName = params["flowName"];

  let flow = null;

  if(!fn.exists(flowName)) {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request - must specify a flowName"]));
  }
  else{
    flow = datahub.flow.getFlow(flowName);
    let uris = params['identifier'];

  }
  return flow;
};


function post(context, params, input) {};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
