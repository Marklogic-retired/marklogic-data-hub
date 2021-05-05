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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const FlowExecutionContext = require("/data-hub/5/flow/flowExecutionContext.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");

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

module.exports = {
  makeEnvelope,
  runFlowOnContent,
  runFlowStepOnContent
}