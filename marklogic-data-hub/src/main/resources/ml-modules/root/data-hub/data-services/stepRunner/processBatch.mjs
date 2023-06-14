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

import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";

function assertQueryMode() {
  if (fn.empty(xdmp.requestTimestamp())) {
    throw new Error("Should be a query transaction!");
  }
}

assertQueryMode();

const inputs = fn.head(xdmp.fromJSON(external.input));

const flowName = inputs.flowName;
if (!fn.exists(flowName)) {
  httpUtils.throwBadRequest(`Invalid request - must specify a flowName`);
}

const stepNumber = inputs.stepNumber;
const jobId = inputs.jobId;

// These are not just the runtime options that a user can provide. It is expected that this is
// called by the Java ScriptStepRunner class, which has its own logic for combining options.
const options = inputs.options;

const datahub = DataHubSingleton.instance({
  performanceMetrics: !!options.performanceMetrics
});

const content = datahub.flow.findMatchingContent(flowName, stepNumber, options);
let results;

try {
  results = datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
} catch (e) {
  results = {
    errors: [e.toString()],
    completedItems: [],
    failedItems: options.uris,
    errorCount: options.uris.length,
    totalCount: options.uris.length
  };
}


Sequence.from([
  external.endpointState ? fn.head(xdmp.fromJSON(external.endpointState)): null,
  results
]);
