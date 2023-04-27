/*
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
// No privilege required: No special privilege is needed for this endpoint
'use strict';

import httpUtils from "/data-hub/5/impl/http-utils.mjs";


const searchProperty = external.searchProperty;
const referenceName = external.referenceName;
if (!(searchProperty && referenceName)) {
  httpUtils.throwBadRequest("Must specify a search property and reference in order to get item references");
}

const stepNames = cts.search(cts.andQuery([cts.collectionQuery("http://marklogic.com/data-hub/steps"), cts.jsonPropertyValueQuery(searchProperty, referenceName)])).toArray().map(step => fn.string(step.root.name));

const result = { stepNames };

result;
