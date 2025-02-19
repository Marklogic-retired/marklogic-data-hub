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
  const searchResponse = content.toObject();
  entitySearchLib.addDocumentMetadataToSearchResults(searchResponse);
  return searchResponse;
}

exports.transform = transform;