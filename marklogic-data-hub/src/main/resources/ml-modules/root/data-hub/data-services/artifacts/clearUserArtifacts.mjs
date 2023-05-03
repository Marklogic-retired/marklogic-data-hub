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
// No privilege required: If the user doesn't have permission to update artifacts, their deletion will fail
import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

let urisToDelete = cts.uris(null, ["concurrent", "score-zero"], cts.andNotQuery(cts.collectionQuery(consts.USER_ARTIFACT_COLLECTIONS.concat('http://marklogic.com/data-hub/mappings'))
  , cts.collectionQuery(consts.HUB_ARTIFACT_COLLECTION)));
for (const uri of urisToDelete) {
  hubUtils.deleteDocument(uri);
}

