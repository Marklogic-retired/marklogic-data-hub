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

//todo flush this out
function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let flowName = params["flow-name"];

  if (!fn.exists(flowName)) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([400, "Bad Request", "Invalid request - must specify a flowName"]));
  } else {
    let options = params["options"] ? JSON.parse(params["options"]) : {};
    const datahub = new DataHub({ performanceMetrics: !!options.performanceMetrics });
    let jobId = params["job-id"];
    let flow = datahub.flow.getFlow(flowName);
    let targetDatabase = params["target-database"] ? xdmp.database(params["target-database"]) : xdmp.database(datahub.config.FINALDATABASE);

    let query = null;
    let uris = null;
    if (params.uri || options.uris) {
      uris = datahub.hubUtils.normalizeToArray(params.uri || options.uris);
      query = cts.documentQuery(uris);
    } else {
      let identifier = options.identifier || flow.identifier;
      query = identifier ? cts.query(identifier) : cts.orQuery([]);
    }
    let content = null;
    if (Object.keys(input).length === 0 && input.constructor === Object) {
      content = input;
    } else {
      datahub.hubUtils.queryLatest(function () {
        content = {};
        let results =  cts.search(query, cts.indexOrder(cts.uriReference()));
        for (let doc of results) {
          content[xdmp.nodeUri(doc)] = doc;
        }
      }, flow.sourceDb || datahub.flow.globalContext.sourceDb);
      uris = Object.keys(content);
    }
    return datahub.flow.runFlow(flowName, jobId, uris, content, options, params.step);
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
