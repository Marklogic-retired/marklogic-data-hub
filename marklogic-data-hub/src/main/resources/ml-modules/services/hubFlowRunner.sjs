/**
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

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

function post(context, params, input) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/run-step", "execute");
  return isXmlInput(context) ? processXmlInput(input) : processJsonInput(input);
}

function isXmlInput(context) {
  let inputTypes = context.inputTypes;
  if (!Array.isArray(inputTypes)) {
    inputTypes = [inputTypes];
  }
  return inputTypes.includes("application/xml") || inputTypes.includes("text/xml");
}

function processJsonInput(input) {
  input = input.toObject();
  const jobId = input.jobId || sem.uuidString();
  
  let stepNumbers = input.steps || [];
  if (stepNumbers && !Array.isArray(stepNumbers)) {
    stepNumbers = [stepNumbers];
  }

  return flowApi.runFlowOnContent(input.flowName, input.content, jobId, input.options, stepNumbers);
}

function processXmlInput(input) {
  const jobId = fn.head(input.xpath("/input/jobId/text()")) || sem.uuidString();
  const flowName = fn.head(input.xpath("/input/flowName/text()"));
  const options = parseJsonOptions(input);
  const contentArray = buildContentArray(input);

  let stepNumbers = fn.head(input.xpath("/input/steps/text()"));
  stepNumbers = stepNumbers ? stepNumbers.toString().split(",") : null;

  return flowApi.runFlowOnContent(flowName, contentArray, jobId, options, stepNumbers);
}

function parseJsonOptions(input) {
  if (fn.head(input.xpath("/input/options"))) {
    let options = input.xpath("/input/options/text()");
    try {
      return fn.head(xdmp.fromJsonString(options));
    } catch (error) {
      httpUtils.throwBadRequest(`Could not parse JSON options; cause: ${error.message}; options: ${options}`);
    }
  }
  // An empty object is returned instead of null to avoid the chance of null breaking something elsewhere
  return {};
}

function buildContentArray(xmlInput) {
  const contentArray = [];
  for (var content of xmlInput.xpath("/input/content")) {
    const uri = fn.head(content.xpath("uri/text()")).toString();
    const value = fn.head(content.xpath("value/node()"));
    contentArray.push({uri, value});
  }
  return contentArray;
}

exports.POST = post;
