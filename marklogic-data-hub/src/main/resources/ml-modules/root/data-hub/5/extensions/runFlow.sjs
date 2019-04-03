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
      query = identifier ? cts.query(identifier) : null;
    }
    let content = [];
    if (!query && input && fn.count(input) === uris.length) {
      content = datahub.hubUtils.normalizeToArray(input).map((inputDoc, i) => { return { uri: uris[i],  value: inputDoc }; });
    } else {
      datahub.hubUtils.queryLatest(function () {
        let results = cts.search(query, cts.indexOrder(cts.uriReference()));
        for (let doc of results) {
          content.push({
            uri: xdmp.nodeUri(doc),
            value: doc,
            context: {
              collections: options.collections || xdmp.nodeCollections(doc),
              permissions: xdmp.nodePermissions(doc),
              metadata: xdmp.nodeMetadata(doc)
            }
          });
        }
      }, flow.sourceDatabase || datahub.flow.globalContext.sourceDb);
    }
    return datahub.flow.runFlow(flowName, jobId, content, options, params.step);
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
