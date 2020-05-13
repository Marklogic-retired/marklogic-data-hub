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
const consts = require("/data-hub/5/impl/consts.sjs");

var stepDefinitionType;
var stepName;

const stepId = stepName + "-" + stepDefinitionType;
xdmp.trace(consts.TRACE_STEP, `Deleting step ${stepId}`);

const flowsWithReferences = cts.search(cts.andQuery([
  cts.collectionQuery(consts.FLOW_COLLECTION),
  cts.jsonPropertyValueQuery("stepId", stepId, "case-insensitive")
]));

for (var flowDoc of flowsWithReferences) {
  const flow = flowDoc.toObject();
  let foundStep = false;
  Object.keys(flow.steps).forEach(key => {
    if (flow.steps[key].stepId && flow.steps[key].stepId.toLowerCase() == stepId.toLowerCase()) {
      foundStep = true;
      delete flow.steps[key];
    }
  });

  if (foundStep) {
    xdmp.trace(consts.TRACE_STEP, `Removing step ${stepId} from flow ${flow.name}`);
    Artifacts.setArtifact("flow", flow.name, flow);
  }
}

Artifacts.deleteArtifact(stepDefinitionType, stepName);
xdmp.trace(consts.TRACE_STEP, `Finished deleting step ${stepId}`);
