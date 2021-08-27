/*
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

declareUpdate();

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

var model = fn.head(xdmp.fromJSON(model));

const name = model.info.title;
if (name == null) {
  httpUtils.throwBadRequest("The model must have an info object with a title property");
}

entityLib.writeDraftModel(name, model);
