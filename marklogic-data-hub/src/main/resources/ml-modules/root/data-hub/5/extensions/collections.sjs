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
  let resp;
  let database = params.database ? params.database.trim() : null;
  let sourceQuery = params.sourceQuery ? params.sourceQuery.trim() : null;
  let limit = params.count || 1;

  try {
    if (sourceQuery) {
      resp = [];

      let docs = xdmp.eval("fn.subsequence(cts.search(" + sourceQuery + ", ['unfiltered', 'unchecked', 'unfaceted']), 1, " + limit + ")", null, {database: xdmp.database(database)});
      docs = docs.toArray();
      let i;
      for (i in docs) {
        let obj = {
          "uri": xdmp.nodeUri(docs[i]),
          "docs": docs[i]
        };
        resp.push(obj);
      }
    } else {
      resp = xdmp.eval("cts.collections(null, ['map'])", null, {database: xdmp.database(database)});
    }
  } catch (err) {
    datahub.debug.log(err);
  }

  return resp;
}

exports.GET = get;
