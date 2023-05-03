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
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-mapping", "execute");

for (const uri of cts.uris(null, ["concurrent", "score-zero", "eager"], cts.collectionQuery("http://marklogic.com/data-hub/mappings"))) {
  const doc = cts.doc(uri);
  // "Touch" the document to force the trigger to run
  hubUtils.nodeReplace(cts.doc(uri), doc);
}
