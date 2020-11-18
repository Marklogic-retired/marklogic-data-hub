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

const stepMap = {};

function getFlowsWithStepDetails(flowName = null){
  if(flowName){
    return getStepDetails(Artifacts.getArtifact("flow", flowName));
  }
  else {
    let flows = Artifacts.getArtifacts("flow");
    //stepMap is used only to get "sourceFormat" and "targetEntityType" which is not required when getting a flow with latest job info
    buildStepMap(flows);
    return flows.map(flow => {
      return getStepDetails(flow);
    });
  }
}

function getStepDetails(flow){
  const flowWithStepDetails = {name: flow.name};
  if (flow.description) {
    flowWithStepDetails.description = flow.description;
  }
  if (flow.steps) {
    flowWithStepDetails.steps = [];
    Object.keys(flow.steps).forEach(stepNumber => {
      const stepDetails = {stepNumber};
      flowWithStepDetails.steps.push(stepDetails);
      let step = flow.steps[stepNumber];
      const stepId = flow.steps[stepNumber].stepId;
      if (stepId) {
        let index = stepId.lastIndexOf('-');
        stepDetails.stepName = stepId.substring(0, index);
        stepDetails.stepDefinitionType = stepId.substring(index + 1, stepId.length);
        //'stepMap' is generated only when getting all flows ('flowName' is null)
        if (Object.keys(stepMap).length > 0) {
          step = stepMap[stepId];
          if (!step) {
            httpUtils.throwBadRequest(`Unable to find referenced step with ID ${stepId} in flow ${flow.name}`);
          }
        }
      }
      else {
        stepDetails.stepName = step.name;
        stepDetails.stepDefinitionType = step.stepDefinitionType;
      }
      stepDetails.stepId = stepId;
      if(step){
        stepDetails.sourceFormat = step.sourceFormat;
        // accommodating targetEntity which is still used by mastering (match/merge) for the time being
        stepDetails.targetEntityType = step.targetEntityType || step.targetEntity;
      }
    });
  }
  return flowWithStepDetails;
}

function buildStepMap(flows){
  // Find all stepIds so we can retrieve them in one query
  const stepIds = [];
  flows.forEach(flow => {
    Object.keys(flow.steps).forEach(key => {
      if (flow.steps[key].stepId) {
        stepIds.push(flow.steps[key].stepId);
      }
    });
  });

// Query for referenced steps, if any exist
  const steps = stepIds.length < 1 ? [] :
    cts.search(cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/steps"),
      cts.jsonPropertyValueQuery("stepId", stepIds, "case-insensitive")
    ]));

// Build a map of steps for fast access
  for (var step of steps) {
    step = step.toObject();
    stepMap[step.stepId] = step;
  }
}

module.exports = {
  getFlowsWithStepDetails
};
