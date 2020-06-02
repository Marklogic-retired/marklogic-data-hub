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

// TODO Will move this to /data-hub/5/entities soon
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

function addPropertiesToSearchResponse(entityName, searchResponse) {
  const entityType = entityLib.findEntityTypeByEntityName(entityName);

  // Determine the properties to collect
  const defaultPropertyNames = [];
  const allSimplePropertyNames = [];

  const maxDefaultProperties = 5;

  for (var propName of Object.keys(entityType.properties)) {
    const prop = entityType.properties[propName];
    const isSimpleProp = prop.datatype != "array" && !prop["$ref"];
    if (isSimpleProp) {
      allSimplePropertyNames.push(propName);
      if (defaultPropertyNames.length < maxDefaultProperties) {
        defaultPropertyNames.push(propName);
      }
    }
  }

  // Add entityProperties to each search result
  searchResponse.results.forEach(result => {
    // TODO What to do if there's no envelope?
    const instance = cts.doc(result.uri).toObject().envelope.instance;

    // TODO Do we need this handling? Is the entityName property guaranteed to exist?
    const entityInstance = instance[entityName] ? instance[entityName] : instance;

    result.entityProperties = {};
    defaultPropertyNames.forEach(propName => {
      if (entityInstance[propName]) {
        result.entityProperties[propName] = entityInstance[propName];
      }
    });
  });

  // Make it easy for the client to know which property names were used, and which ones exist
  searchResponse.selectedPropertyNames = defaultPropertyNames;
  searchResponse.entityPropertyNames = allSimplePropertyNames;
}

module.exports = {
  addPropertiesToSearchResponse
}
