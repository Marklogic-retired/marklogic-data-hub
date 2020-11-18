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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-flow", "execute");

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var flowName;
var stepNumber;

const flow = Artifacts.getArtifact("flow", flowName);
const steps = flow.steps;

if (!flow.steps[stepNumber]) {
  httpUtils.throwBadRequest(`Cannot remove step; could not find in flow ${flowName} a step with number ${stepNumber}`);
}

const stepNumbers = Object.keys(steps).filter(key => key != stepNumber);

// Iterate over the existing steps, removing the one that doesn't exist, and decrementing the step number of all steps
// "after" the removed step
const stepsWithoutRemovedStep = {};
const numericStepNumber = parseInt(stepNumber);
Object.keys(steps).filter(key => key != stepNumber).forEach(key => {
  const numericKey = parseInt(key);
  if (numericKey > numericStepNumber) {
    const newKey = numericKey - 1;
    stepsWithoutRemovedStep[newKey] = steps[key];
  } else if (numericKey < numericStepNumber) {
    stepsWithoutRemovedStep[key] = steps[key];
  }
});

flow.steps = stepsWithoutRemovedStep;
Artifacts.setArtifact("flow", flowName, flow);
