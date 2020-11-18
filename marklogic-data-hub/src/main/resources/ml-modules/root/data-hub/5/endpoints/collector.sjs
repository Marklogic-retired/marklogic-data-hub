/*
 * Copyright 2016-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
const parameters = require("/MarkLogic/rest-api/endpoints/parameters.xqy");
const CollectorLib = require("/data-hub/5/endpoints/collectorLib.sjs");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

xdmp.securityAssert(['http://marklogic.com/xdmp/privileges/rest-reader'], 'execute');


const method = xdmp.getRequestMethod();

const requestParams = new Map();

parameters.queryParameter(requestParams, "flow-name",fn.true(),fn.false())
parameters.queryParameter(requestParams, "options",fn.false(),fn.false())
parameters.queryParameter(requestParams, "step",fn.false(),fn.false())
parameters.queryParameter(requestParams, "database",fn.true(),fn.false())

// Refactored to not set xdmp.eval results to variable for efficiency reasons
if (method !== 'GET') {
  fn.error(null, 'RESTAPI-INVALIDREQ', 'unsupported method: '+method);
}
const flowName = requestParams["flow-name"];
let step = requestParams.step;
if (!step) {
  step = 1;
}
let options = requestParams.options ? JSON.parse(requestParams.options) : {};

let flowDoc= datahub.flow.getFlow(flowName);
if (!fn.exists(flowDoc)) {
  httpUtils.throwNotFoundWithArray(["Not Found", "The requested flow was not found"]);
}

let stepDoc = flowDoc.steps[step];
if (!stepDoc) {
  httpUtils.throwNotFoundWithArray(["Not Found", `The step number "${step}" of the flow was not found`]);
}

let stepDefinition = datahub.flow.step.getStepByNameAndType(stepDoc.stepDefinitionName, stepDoc.stepDefinitionType);
if (!stepDefinition) {
  httpUtils.throwNotFoundWithArray(["Not Found", `A step with name "${stepDoc.stepDefinitionName}" and type of "${stepDoc.stepDefinitionType}" was not found`]);
}

let combinedOptions = Object.assign({}, stepDefinition.options, flowDoc.options, stepDoc.options, options);
const database = combinedOptions.sourceDatabase || requestParams.database;
if(!combinedOptions.sourceQuery && flowDoc.sourceQuery) {
  combinedOptions.sourceQuery = flowDoc.sourceQuery;
}

let query = combinedOptions.sourceQuery;
if (!query) {
  datahub.debug.log("The collector query was empty");
  httpUtils.throwNotFoundWithArray([404, "Not Found", "The collector query was empty"]);
}

const javascript = new CollectorLib(datahub).prepareSourceQuery(combinedOptions, stepDefinition);
try {
  /**
   * DHF 5 has always used this eval, and it certainly is open for code injection. This is partially minimized
   * by this collector code running in query mode, thus preventing updates. Additionally, while the DHF users
   * almost all have the required privileges to evaluate code, other functions like xdmp.shutdown require their
   * own privileges. Furthermore, a malicious user doesn't need to bother with exploiting this but rather can just
   * hit /v1/eval directly. The broader issue is that DHF users should not have as many privileges as they do, and
   * amps should be used instead for when it's necessary to e.g. evaluate code.
   */
  xdmp.eval(javascript, {options: options}, {database: xdmp.database(database)});
} catch (err) {
  datahub.debug.log(err);
  fn.error(null, 'RESTAPI-INVALIDREQ', err);
}
