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
// No privilege required: If the user doesn't have permission to update artifacts, their deletion will fail
'use strict';
declareUpdate();
const consts = require('/data-hub/5/impl/consts.sjs');

let urisToDelete = cts.uris(null, null, cts.andQuery([cts.collectionQuery(consts.USER_ARTIFACT_COLLECTIONS.concat('http://marklogic.com/data-hub/mappings'))
  ,cts.notQuery(cts.collectionQuery(consts.HUB_ARTIFACT_COLLECTION))])).toArray();
urisToDelete.forEach(uri => xdmp.documentDelete(uri));

