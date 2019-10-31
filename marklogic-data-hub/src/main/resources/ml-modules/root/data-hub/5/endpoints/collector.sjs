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
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

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
  fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", "The requested flow was not found"]));
}
let stepDoc = flowDoc.steps[step];
if (!stepDoc) {
  fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", `The step number "${step}" of the flow was not found`]));
}
let baseStep = datahub.flow.step.getStepByNameAndType(stepDoc.stepDefinitionName, stepDoc.stepDefinitionType);
if (!baseStep) {
  fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", `A step with name "${stepDoc.stepDefinitionName}" and type of "${stepDoc.stepDefinitionType}" was not found`]));
}
let combinedOptions = Object.assign({}, baseStep.options, flowDoc.options, stepDoc.options, options);
const database = combinedOptions.sourceDatabase || requestParams.database;
if(!combinedOptions.sourceQuery && flowDoc.sourceQuery) {
  combinedOptions.sourceQuery = flowDoc.sourceQuery;
}
let query = combinedOptions.sourceQuery;
let isMergingStep = baseStep.name === 'default-merging' && baseStep.type === 'merging';
if (!query) {
  datahub.debug.log("The collector query was empty");
  fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", "The collector query was empty"]));
}
if (isMergingStep) {
  query = fn.normalizeSpace(`cts.values(
    cts.pathReference('/matchSummary/URIsToProcess', ['type=string','collation=http://marklogic.com/collation/']),
    null,
    null,
    ${query}
  )`);
}
try {
  let urisEval;
  if (/^\s*cts\.(uris|values)\(.*\)\s*$/.test(query)) {
    urisEval = query;
  } else {
    urisEval = "cts.uris(null, null, " + query + ")";
  }
  xdmp.eval(urisEval, {options: options}, {database: xdmp.database(database)});
} catch (err) {
  //TODO log error message from 'err'

  datahub.debug.log(err);
  fn.error(null, 'RESTAPI-INVALIDREQ', err);
}
