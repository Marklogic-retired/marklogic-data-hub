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
xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-mapping", "execute");

const core = require('/data-hub/5/artifacts/core.sjs')
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const FlowExecutionContext = require("/data-hub/5/flow/flowExecutionContext.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");

var stepName, uri;

const mappingStep = core.getArtifact("mapping", stepName);
const inlineMappingStep = Artifacts.convertStepReferenceToInlineStep(mappingStep.stepId, null);

const flow = {
  "name" : "inMemoryFlow-" + stepName,
  "steps" : {
    "1": inlineMappingStep
  }
}

const flowExecutionContext = new FlowExecutionContext(flow, null, null, [1]);
const stepExecutionContext = StepExecutionContext.newContext(flowExecutionContext, 1);

let originalSourceDoc;
if(mappingStep.sourceDatabase) {
  originalSourceDoc = fn.head(xdmp.eval("cts.doc('" + uri + "')", null, {database: xdmp.database(mappingStep.sourceDatabase)}));
}
else{
  originalSourceDoc = cts.doc(uri);
}

const contentArray = [];
let content = {};
content.uri = uri;
content.value = originalSourceDoc;
contentArray.push(content);

try{
  flowRunner.invokeInterceptors(stepExecutionContext, contentArray, "beforeMain");
}
catch(e){
  httpUtils.throwBadRequest("Interceptor execution failed;cause: " + Error(e).message);
}

xdmp.quote(contentArray[0].value);




