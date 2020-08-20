/**
 Copyright (c) 2020 MarkLogic Corporation

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

// No privilege required: This endpoint is called by the spark connector.

var endpointState; // jsonDocument?

var input;         // jsonDocument*
declareUpdate();

const ingest = require("/data-hub/5/builtins/steps/ingestion/default/main.sjs");
const consts = require('/data-hub/5/impl/consts.sjs');
const state  = fn.head(xdmp.fromJSON(endpointState));

const work = fn.head(xdmp.fromJSON(workUnit));

const inputs =
    (input instanceof Sequence) ? input.toArray().map(item => fn.head(xdmp.fromJSON(item))) :
    (input instanceof Document) ? [fn.head(xdmp.fromJSON(input))] :
                                  [ {UNKNOWN: input} ];
inputs.forEach(record => {
  state.next = state.next + 1;
  const uri =(state.prefix)+'/'+(work.taskId)+'/'+(state.next)+'.json'
  record = ingest.main({uri: uri, value: record}, {
       outputFormat: consts.JSON, headers: {createdOn: consts.CURRENT_DATE_TIME, createdBy: consts.CURRENT_USER}
  }).value;
  xdmp.documentInsert(
    uri,
    record,
    {permissions:[
            xdmp.permission('data-hub-common', 'read'),
            xdmp.permission('data-hub-common', 'update')
        ]
    }
  )
});

const returnValue = (fn.count(input) > 0) ? state : null;

returnValue;
