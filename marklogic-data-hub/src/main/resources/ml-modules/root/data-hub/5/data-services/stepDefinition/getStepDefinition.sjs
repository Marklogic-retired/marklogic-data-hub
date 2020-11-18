/*
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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-flow", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var name;
var type;

let query = cts.andQuery([
  cts.collectionQuery("http://marklogic.com/data-hub/step-definition"),
  cts.directoryQuery("/step-definitions/" + type.toLowerCase() + "/", "infinity"),
  cts.jsonPropertyValueQuery("name", name)
]);

let result = fn.head(fn.subsequence(cts.search(query), 1, 1));

if (result != undefined) {
  result
} else {
  httpUtils.throwBadRequest(`Could not find a step definition with name '${name}' and type '${type}'`);
}
