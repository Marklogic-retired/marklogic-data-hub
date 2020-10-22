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
xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");

const core = require('/data-hub/5/artifacts/core.sjs')

var stepName, limit;
let mappingStep = core.getArtifact("mapping", stepName);
let resp = [];
if(mappingStep.sourceQuery){
  if(mappingStep.sourceDatabase){
    resp = xdmp.eval("cts.uris(null, ['limit=" + limit + "'], " + mappingStep.sourceQuery + ")", null, {database: xdmp.database(mappingStep.sourceDatabase)}).toArray();
  }
  else {
    resp = cts.uris(null, ['limit=' + limit], xdmp.eval(mappingStep.sourceQuery)).toArray();
  }
}
resp
