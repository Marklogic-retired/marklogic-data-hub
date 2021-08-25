/**
 Copyright (c) 2021 MarkLogic Corporation

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

function postProcessDatabaseProperties(databaseProperties) {
  // databaseProperties is a document-node, so must call toObject() first in order to modify it
  databaseProperties = databaseProperties.toObject();

  if (databaseProperties["range-path-index"]) {
    databaseProperties["range-path-index"].forEach(index => {
      let expr = index["path-expression"];
      const tokens = expr.split("/").slice(-2);
      const entityName = tokens[0];
      const propertyName = tokens[1];
      index["path-expression"] = "/customEnvelope/" + entityName + "/" + propertyName + "/value";
    })
  }

  // Must return a document-node
  return xdmp.toJSON(databaseProperties);
}

module.exports = {
  postProcessDatabaseProperties
}
