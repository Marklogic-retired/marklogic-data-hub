/*
  Copyright 2012-2022 MarkLogic Corporation

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

import conceptLib from "/data-hub/5/impl/concept-lib.mjs";
import config from "/com.marklogic.hub/config.mjs";

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const models = external.models.toObject();
const databases = [config.STAGINGDATABASE, config.FINALDATABASE];

models.forEach(model => {
  const name = model.info.name;
  conceptLib.writeConceptModelToDatabases(name, model, databases, false);
})
