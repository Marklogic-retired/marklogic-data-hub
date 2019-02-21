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
  post(context, params, null);
}

function post(context, params, input) {
  let flowName = params.flowName;

  if (!fn.exists(flowName)) {
    fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([400, "Bad Request", "Invalid request - must specify a flowName"]));
  }
  else {
    let options = params.options ? JSON.parse(params.options) : {};
    let jobId = params.jobId || datahub.hubUtils.uuid();
    let flow = datahub.flow.getFlow(flowName);
    let query = null;
    let uris = null;
    if (params.uri) {
      uris = datahub.hubUtils.normalizeToArray(params.uri);
      query = cts.documentUriQuery(uris);
    } else {
      query = flow.identifier ? cts.query(flow.identifier) : cts.orQuery([]);
    }
    let content = null;
    if (input) {
      content = input.toObject();
    } else {
      content = {};
      datahub.hubUtils.queryLatest(function() {
        for (let doc of cts.search(query, cts.indexOrder(cts.uriReference()))) {
          content[xdmp.nodeUri(doc)] = doc;
        }
      }, flow.sourceDb || datahub.flow.globalContext.sourceDb);
      uris = Object.keys(content);
    }
    return datahub.flow.runFlow(flowName, jobId, uris, content, options, params.stepNumber);
  }
}

function put(context, params, input) {}

function deleteFunction(context, params) {}

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
