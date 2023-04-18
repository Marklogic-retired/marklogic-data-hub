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

/**
 * Defines public functions pertaining to DHF flows and steps.
 */

import Artifacts from '/data-hub/5/artifacts/core.mjs';
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import flowUtils from "/data-hub/5/impl/flow-utils.mjs";
import flowRunner from "/data-hub/5/flow/flowRunner.mjs";
import FlowExecutionContext from "/data-hub/5/flow/flowExecutionContext.mjs";
import StepExecutionContext from "/data-hub/5/flow/stepExecutionContext.mjs";

const json = require('/MarkLogic/json/json.xqy');

/**
 * Returns an envelope based on the given arguments.
 *
 * @param {object} instance the data to add to the "instance" section of the envelope
 * @param {object} headers the data to add to the "headers" section of the envelope
 * @param {array} triples the data to add to the "triples" section of the envelope
 * @param {string} outputFormat the format of the returned enveloped; either "json" or "xml"
 * @returns {object} the envelope object
 */
function makeEnvelope(instance, headers, triples, outputFormat = "json") {
  return flowUtils.makeEnvelope(instance, headers, triples, outputFormat);
}

/**
 * Runs a flow against the given array of content. Each step is run in-memory, with the output of one step becoming the
 * input of the next step. The sourceQuery of each step is thus ignored, as the input to each step is either the
 * given contentArray for the first step, or the output of the previous step for every other step.
 *
 * @param {string} flowName required name of the flow to be run; if the flow is not found, an error is thrown
 * @param {array} contentArray array of objects conforming to ContentObject.schema.json; at a minimum, content.uri
 * must be specified. Typically, content.value will be set with the document to be processed, and content.uri is set to
 * provide an initial URI, which one of the steps may adjust. A client may also specify parts of content.context, though
 * it is more typical that a step will define this when it processes each content object.
 * @param {string} jobId optional identifier for the job that will be created; if not specified, will be a UUID
 * @param {object} runtimeOptions optional object defining options to adjust flow/step behavior
 * @param {array} stepNumbers optional array of the step numbers to run; if not specified, all steps are run; if any step number
 * cannot be found, an error is thrown
 * @return a JSON object conforming to RunFlowResponse.schema.json
 */
function runFlowOnContent(flowName, contentArray, jobId, runtimeOptions, stepNumbers) {
  return flowRunner.runFlowOnContent(flowName, contentArray, jobId, runtimeOptions, stepNumbers);
}

/**
 * Run the step identified by flowName and stepNumber against the given content, but do not persist anything -
 * instead, return the content array produced by execution of the step and the step response, which captures
 * metadata about the step execution.
 *
 * @param {string} flowName identifies the flow, which must exist in the database, containing the step to be run
 * @param {string} stepNumber identifies the step in the flow to run
 * @param {array} contentArray array of objects conforming to ContentObject.schema.json; at a minimum, content.uri
 * must be specified. Typically, content.value will be set with the document to be processed, and content.uri is set to
 * provide an initial URI, which one of the steps may adjust. A client may also specify parts of content.context, though
 * it is more typical that a step will define this when it processes each content object.
 * @param {object} runtimeOptions optional object defining options to adjust step behavior
 * @returns {object} an object with keys of 'contentArray' and 'stepResponse'; the former contains the
 * output content objects return by the step, if any; the latter contains the metadata about running the step
 */
function runFlowStepOnContent(flowName, stepNumber, contentArray, runtimeOptions) {
  const flow = Artifacts.getFullFlow(flowName);
  const flowExecutionContext = new FlowExecutionContext(flow, null, runtimeOptions, [stepNumber]);
  const stepExecutionContext = StepExecutionContext.newContext(flowExecutionContext, stepNumber);
  const writeQueue = null;

  flowRunner.prepareContentBeforeStepIsRun(stepExecutionContext, contentArray);
  const outputContentArray = flowRunner.runStepAgainstSourceDatabase(stepExecutionContext, contentArray, writeQueue);
  return {
    contentArray: outputContentArray,
    stepResponse: stepExecutionContext.buildStepResponse()
  }
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

  if (input.content && input.content.length) {
    input.content.forEach((item) => {
      if (!item.value && item.uri) {
        item.value = cts.doc(item.uri);
      }
    });
  }
  return runFlowOnContent(input.flowName, input.content, jobId, input.options, stepNumbers);
}

function processXmlInput(input) {
  // Job ID must be a string. A Text Node causes PROVO library to throw an error.
  const jobId = fn.string(fn.head(input.xpath("/input/jobId/text()"))) || sem.uuidString();
  const flowName = fn.head(input.xpath("/input/flowName/text()"));
  const options = parseJsonOptionsFromXml(input);
  const contentArray = buildContentArray(input);

  let stepNumbers = fn.head(input.xpath("/input/steps/text()"));
  stepNumbers = stepNumbers ? stepNumbers.toString().split(",") : null;

  return runFlowOnContent(flowName, contentArray, jobId, options, stepNumbers);
}

function parseJsonOptionsFromXml(input) {
  if (fn.exists(input.xpath("/input/options"))) {
    let options = fn.head(input.xpath("/input/options"));
    // Convert elements to a JSON Object
    if (fn.exists(options.xpath("*"))) {
      let jsonConfig = json.config("custom");
      jsonConfig["whitespace"] = "ignore";
      let optionsJson = fn.head(json.transformToJsonObject(options, jsonConfig)).options;
      for (let key of Object.keys(optionsJson)) {
        let value = optionsJson[key];
        if (value === "true" || value === "false") {
          optionsJson[key] = xs.boolean(value);
        }
      }
      return optionsJson;
      // Fall-back to JSON String if provided
    } else if (fn.exists(options.xpath("text()[normalize-space()]"))) {
      try {
        return JSON.parse(fn.string(options));
      } catch (error) {
        httpUtils.throwBadRequest(`Could not parse JSON options; cause: ${error.message}; options: ${options}`);
      }
    }
  }
  // An empty object is returned instead of null to avoid the chance of null breaking something elsewhere
  return {};
}

function buildContentArray(xmlInput) {
  const contentArray = [];
  for (var content of xmlInput.xpath("/input/content")) {
    const uri = fn.head(content.xpath("uri/text()")).toString();
    let value = fn.head(content.xpath("value/node()"));
    if (fn.empty(value)) {
      value = cts.doc(uri);
    }
    contentArray.push({uri, value});
  }
  return contentArray;
}

function processPost(context, params, input) {
  xdmp.securityAssert("http://marklogic.com/data-hub/privileges/run-step", "execute");
  return isXmlInput(context) ? processXmlInput(input) : processJsonInput(input);
}

export default{
  makeEnvelope,
  processPost,
  runFlowOnContent,
  runFlowStepOnContent
}
