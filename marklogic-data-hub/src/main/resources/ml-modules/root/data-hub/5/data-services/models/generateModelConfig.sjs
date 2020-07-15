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

const consts = require("/data-hub/5/impl/consts.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");


const result = {
  "protectedPaths": [],
  "queryRolesets": [],
  "indexConfig": {},
  "searchOptions": {}
};

const entityModels = cts.search(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION)).toArray();
if (entityModels.length > 0) {
  // Add PII files
  const securityConfig = hent.dumpPii(entityModels).toObject();
  const protectedPathsExist = securityConfig.config && securityConfig.config["protected-path"] && securityConfig.config["protected-path"].length > 0;
  if (protectedPathsExist) {
    securityConfig.config["protected-path"].forEach(path => {
      result.protectedPaths.push(xdmp.toJSON(path));
    });
    if (securityConfig.config["query-roleset"]) {
      result.queryRolesets.push(xdmp.toJSON(securityConfig.config["query-roleset"]));
    }
  }

  // Add indexes
  const dbProps = hent.dumpIndexes(entityModels);
  result.indexConfig = dbProps.toObject();
}

// Add search options
// Even if there are no entity models we still want to generate the search options
result.searchOptions["default"] = hent.dumpSearchOptions(entityModels, false);
result.searchOptions["explorer"] = hent.dumpSearchOptions(entityModels, true);

result;
