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

declareUpdate();

// No privilege required: This endpoint is called by the spark connector.

const consts = require("/data-hub/5/impl/consts.sjs");
const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const temporal = require("/MarkLogic/temporal.xqy");
const writeLib = require("writeLib.sjs");

var endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));
const inputArray = writeLib.normalizeInputToArray(input);

const insertOptions = writeLib.buildInsertOptions(endpointConstants);
const headers = writeLib.buildHeaders(endpointConstants);

const flowUtils = new FlowUtils();

inputArray.forEach(record => {
  const uri = writeLib.generateUri(record, endpointConstants);
  const envelope = flowUtils.makeEnvelope(record, headers, [], consts.JSON);

  if (insertOptions.temporalCollection) {
    temporal.documentInsert(insertOptions.temporalCollection, uri, envelope, insertOptions.options);
  } else {
    xdmp.documentInsert(uri, envelope, insertOptions.options);
  }
});
