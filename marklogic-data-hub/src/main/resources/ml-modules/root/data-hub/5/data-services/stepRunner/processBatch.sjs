/*
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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/run-step", "execute");

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");

var inputs;
inputs = fn.head(xdmp.fromJSON(inputs));

const flowName = inputs.flowName;
if (!fn.exists(flowName)) {
  httpUtils.throwBadRequest(`Invalid request - must specify a flowName`);
}

const stepNumber = inputs.stepNumber;
const jobId = inputs.jobId;
const options = inputs.options;

const datahub = DataHubSingleton.instance({
  performanceMetrics: !!options.performanceMetrics
});

const content = datahub.flow.findMatchingContent(flowName, stepNumber, options, null);
datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
