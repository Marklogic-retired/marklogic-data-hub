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

var stepDefinitionType;
var stepName;

stepDefinitionType = stepDefinitionType.toLowerCase();

if ("ingestion" === stepDefinitionType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-ingestion", "execute");
} else if ("mapping" === stepDefinitionType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");
} else if ("matching" === stepDefinitionType || "merging" === stepDefinitionType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");
} else if ("custom" === stepDefinitionType) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-custom", "execute");
} else {
  ds.throwBadRequest("Unsupported step definition type: " + stepDefinitionType);
}

require('/data-hub/5/artifacts/core.sjs').getArtifact(stepDefinitionType, stepName);
