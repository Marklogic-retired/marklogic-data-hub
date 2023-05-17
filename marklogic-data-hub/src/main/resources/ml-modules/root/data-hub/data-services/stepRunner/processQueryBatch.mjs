/*
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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/run-step", "execute");

import collectorLib from  "/data-hub/5/endpoints/collectorLib.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import flowUtils from "/data-hub/5/impl/flow-utils.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";

const endpointConstants = fn.head(xdmp.fromJSON(external.endpointConstants));
const endpointState = fn.head(xdmp.fromJSON(external.endpointState));

const flowName = endpointConstants.flowName;
if (!fn.exists(flowName)) {
  httpUtils.throwBadRequest(`Invalid request - must specify a flowName`);
}

const stepNumber = endpointConstants.stepNumber;
const jobId = endpointConstants.jobId;

// These are not just the runtime options that a user can provide. It is expected that this is
// called by the Java ScriptStepRunner class, which has its own logic for combining options.
const options = endpointConstants.options.options || endpointConstants.options;


const datahub = DataHubSingleton.instance({
  performanceMetrics: !!options.performanceMetrics
});

const flow = datahub.flow.getFlow(flowName);

const flowStep = flow.steps[stepNumber];
if (!flowStep) {
  httpUtils.throwBadRequest(`Could not find step '${stepNumber}' in flow '${flowName}'`);
}

const stepDefinition = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(flowStep.stepDefinitionName, flowStep.stepDefinitionType);
if (!stepDefinition) {
  httpUtils.throwBadRequest(`Could not find a step definition with name '${flowStep.stepDefinitionName}' and type '${flowStep.stepDefinitionType}' for step '${stepNumber}' in flow '${flowName}'`);
}
const combinedOptions = flowUtils.makeCombinedOptions(flow, stepDefinition, stepNumber, options);
const ctsQuery = xdmp.eval(collectorLib.prepareSourceQueryWithoutUris(combinedOptions, stepDefinition));
const forestIDs = endpointConstants.forestIDs ? endpointConstants.forestIDs : xdmp.databaseForests(xdmp.database());

const lastProcessedURI = endpointState.lastProcessedURI;

const finalQuery = lastProcessedURI ? cts.andQuery([ctsQuery, cts.rangeQuery(cts.uriReference(), ">", lastProcessedURI)]): ctsQuery;
const batchSize = combinedOptions.batchSize || 100;

combinedOptions.uris = cts.uris(null, [`limit=${batchSize}`, "score-zero", "eager", "concurrent"], finalQuery, 0, forestIDs).toArray();
if (combinedOptions.uris.length !== 0) {
  const content = datahub.flow.findMatchingContent(flowName, stepNumber, combinedOptions);
  datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);

  const latestReturnCount = combinedOptions.uris.length;
  const newState = latestReturnCount < batchSize ? null: {lastProcessedURI: combinedOptions.uris[latestReturnCount - 1], uris: combinedOptions.uris};

  newState;
}
