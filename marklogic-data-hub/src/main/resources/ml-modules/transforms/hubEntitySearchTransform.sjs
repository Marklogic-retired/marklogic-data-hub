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

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const entitySearchLib = mjsProxy.requireMjsModule("/data-hub/5/entities/entity-search-lib.mjs");

// Expects JSON content
function transform(context, params, content) {
  let entityName = null;
  if(params.entityName) {
    entityName = params.entityName;
  }
  const propertiesToDisplay = params.propertiesToDisplay;

  const contentObject = content.toObject();
  entitySearchLib.addPropertiesToSearchResponse(entityName, contentObject, propertiesToDisplay);

  if(params.forExport === "true") {
    let exportResults = [];
    contentObject.results.forEach(result => {
      let currObj = {};
      currObj["Identifier"] = result["identifier"]["propertyValue"];
      currObj["EntityType"] = result["entityName"];
      currObj["RecordType"] = result["format"];
      currObj["CreatedOn"] = result["createdOn"];
      exportResults.push(currObj);
    });
    return xdmp.quote(Sequence.from(exportResults), {method:'sparql-results-csv'});
  }
  return contentObject;
}

exports.transform = transform;