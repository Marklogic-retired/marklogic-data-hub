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
const Step = require("/data-hub/5/impl/step.sjs");

var stepDefinitionType;
var info;

/**
 * This is temporarily acting as a "save" operation because the HC UI expects to be able to create and update a step
 * via the same endpoint.
 */
info = info.toObject();
const stepName = info.name;

let existingStep = fn.head(cts.search(cts.andQuery([
  cts.collectionQuery("http://marklogic.com/data-hub/steps"),
  cts.jsonPropertyValueQuery("stepDefinitionType", stepDefinitionType, "case-insensitive"),
  cts.jsonPropertyValueQuery("name", stepName)
])));

if (existingStep) {
  let updatedStep = Object.assign(existingStep.toObject(), info);
  Artifacts.setArtifact(stepDefinitionType, stepName, updatedStep);
} else {
  // For now, can assume the stepDefinitionName based on the type. Can add stepDefinitionType as a parameter once we need
  // more flexibility.
  const stepDefinitionName = "mapping" === stepDefinitionType.toLowerCase() ? "entity-services-mapping" : "default-ingestion";


  info.stepDefinitionName = stepDefinitionName;
  info.stepDefinitionType = stepDefinitionType;
  info.stepId = info.name + "-" + stepDefinitionType;

  const stepDef = new Step().getStepByNameAndType(stepDefinitionName, stepDefinitionType);
  const stepDefOptions = stepDef.options;
  Object.keys(stepDefOptions).forEach(key => {
    if (!info[key]) {
      info[key] = stepDefOptions[key];
    }
  });

  Artifacts.setArtifact(stepDefinitionType, info.name, info);
}
