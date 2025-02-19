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

import collectorLib from  "/data-hub/5/endpoints/collectorLib.mjs";
import temporalLib from "/data-hub/5/temporal/hub-temporal.mjs";
import DataHub from  "/data-hub/5/datahub.mjs";
import httpUtils from  "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const parameters = require("/MarkLogic/rest-api/endpoints/parameters.xqy");
const datahub = new DataHub();

xdmp.securityAssert(['http://marklogic.com/xdmp/privileges/rest-reader'], 'execute');

const method = xdmp.getRequestMethod();
if (method !== 'GET') {
  httpUtils.throwMethodNotSupported("Unsupported method: " + method);
}

const requestParams = new Map();
parameters.queryParameter(requestParams, "flow-name",fn.true(),fn.false())
parameters.queryParameter(requestParams, "options",fn.false(),fn.false())
parameters.queryParameter(requestParams, "step",fn.false(),fn.false())
parameters.queryParameter(requestParams, "database",fn.true(),fn.false())

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

let stepDefinition = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepDoc.stepDefinitionName, stepDoc.stepDefinitionType);
if (!stepDefinition) {
  httpUtils.throwNotFoundWithArray(["Not Found", `A step with name "${stepDoc.stepDefinitionName}" and type of "${stepDoc.stepDefinitionType}" was not found`]);
}

let combinedOptions = Object.assign({}, stepDefinition.options, flowDoc.options, stepDoc.options, options);
const database = combinedOptions.sourceDatabase || requestParams.database;

if(combinedOptions.sourceQueryIsModule == true) {
  const stepName = stepDoc.name;
  const sourceModule = combinedOptions["sourceModule"];

  if(!sourceModule) {
    httpUtils.throwBadRequest(`sourceModule is not defined in the step: ${stepName}. modulePath and functionName properties should be defined in the sourceModule object`);
  }

  if(!sourceModule["modulePath"] || !sourceModule["functionName"]) {
    httpUtils.throwBadRequest(`Either modulePath or functionName is not defined in the step: ${stepName}. modulePath and functionName properties should be defined in the sourceModule object`);
  }

  const collectorFunction = hubUtils.requireFunction(sourceModule["modulePath"], sourceModule["functionName"]);
  xdmp.invokeFunction(() => {
    return hubUtils.normalizeToSequence(collectorFunction(combinedOptions.options));
  }, {database: xdmp.database(database)})
} else {
  if(!combinedOptions.sourceQuery && flowDoc.sourceQuery) {
    combinedOptions.sourceQuery = flowDoc.sourceQuery;
  }

  let query = combinedOptions.sourceQuery;

  if(combinedOptions.sourceQueryLimit){
    let sourceQueryLimit = fn.number(combinedOptions.sourceQueryLimit);
    if(isNaN (sourceQueryLimit) || sourceQueryLimit < 1){
      httpUtils.throwBadRequest(`Invalid value ${sourceQueryLimit} for 'sourceQueryLimit' in step '${stepDoc.name}'. It should be a number greater than zero`);
    }
  }

  if (!query) {
    datahub.debug.log("The collector query was empty");
    httpUtils.throwNotFoundWithArray([404, "Not Found", "The collector query was empty"]);
  }

  let javascript =  collectorLib.prepareSourceQuery(combinedOptions, stepDefinition);
  javascript = temporalLib.prepareTemporalSourceQuery(javascript);
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
    httpUtils.throwBadRequest(`Unable to collect items to process; sourceQuery script: ${javascript}; error: ${err.data}`);
  }
}
