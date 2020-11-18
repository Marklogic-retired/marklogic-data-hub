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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var artifactType, artifactName, artifact;

if ("ingestion" === artifactType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-ingestion", "execute");
} else if ("mapping" === artifactType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-mapping", "execute");
} else if ("matching" === artifactType || "merging" === artifactType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-match-merge", "execute");
} else if ("custom" === artifactType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-custom", "execute");
} else if ("flow" === artifactType || "stepDefinition" === artifactType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-flow", "execute");
} else {
  httpUtils.throwBadRequest("Unsupported artifact type: " + artifactType);
}

Artifacts.setArtifact(artifactType, artifactName, artifact.toObject());
