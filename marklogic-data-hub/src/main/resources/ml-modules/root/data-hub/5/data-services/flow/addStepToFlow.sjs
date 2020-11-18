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
var stepName;
var stepDefinitionType;

const stepExists = cts.exists(
  cts.andQuery([
    cts.collectionQuery("http://marklogic.com/data-hub/steps"),
    cts.jsonPropertyValueQuery("name", stepName),
    cts.jsonPropertyValueQuery("stepDefinitionType", stepDefinitionType, ["case-insensitive"])
  ])
);

if (!stepExists) {
  httpUtils.throwBadRequest(`Could not find step with name ${stepName} and type ${stepDefinitionType}`);
}

const flow = Artifacts.getArtifact("flow", flowName);
if (!flow.steps) {
  flow.steps = {};
}

const steps = flow.steps;

// There's no guarantee that the existing numbers are sequential, so gotta find the biggest one and add one to determine
// the new step number.
const existingStepNumbers = Object.keys(steps).map(stepNumber => {
  return parseInt(stepNumber);
});
const newStepNumber = existingStepNumbers.length > 0 ?
  Math.max.apply(null, existingStepNumbers) + 1 : 1;

const stepId = stepName + "-" + stepDefinitionType;

steps[newStepNumber] = {stepId};

Artifacts.setArtifact("flow", flowName, flow);
