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

const ds = require("/data-hub/5/data-services/ds-utils.sjs");
const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");

// Expects JSON content
function transform(context, params, content) {
  if(!params.entityName) {
    ds.throwBadRequest("entityName is required to generate search results containing entity properties");
  }
  const entityName = params.entityName;

  const contentObject = content.toObject();
  entitySearchLib.addPropertiesToSearchResponse(entityName, contentObject);
  return contentObject;
}

exports.transform = transform;
