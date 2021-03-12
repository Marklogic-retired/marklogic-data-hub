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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-flow", "execute");

const Artifacts = require('/data-hub/5/artifacts/core.sjs');

var updatedFlow;
let newSteps = {};

updatedFlow = fn.head(xdmp.fromJSON(updatedFlow));
let name = updatedFlow.name;
let description = updatedFlow.description;
let steps = updatedFlow.steps;

const oldFlow = Artifacts.getArtifact("flow", name);

if (!description && oldFlow.description) {
  delete updatedFlow.description;
}

if (steps) {
  steps = Array.from(steps);
  steps.forEach(function (stepId, i) {
    newSteps[(i+1)] = {"stepId": stepId}
  });
  updatedFlow.steps = newSteps;
} else if (!steps && oldFlow.steps) {
  updatedFlow.steps = oldFlow.steps;
} else {
  updatedFlow.steps = {};
}

Artifacts.setArtifact("flow", name, updatedFlow);
