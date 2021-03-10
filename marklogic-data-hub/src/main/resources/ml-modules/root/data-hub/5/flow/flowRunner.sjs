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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const StepExecutionContext = require('stepExecutionContext.sjs');
const consts = require("/data-hub/5/impl/consts.sjs");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");

/**
 * Processes the given contentArray - a batch of content - against each step in the given flow. Each step
 * is run in-memory, with the output of one step becoming the input of the next step.
 *
 * @param flowName
 * @param contentArray array of objects conforming to ContentObject.schema.json; at a minimum, content.uri 
 * must be specified
 * @param jobId
 * @param runtimeOptions
 * @return a JSON object conforming to RunFlowResponse.schema.json
 */
function processContentWithFlow(flowName, contentArray, jobId, runtimeOptions) {
  if (contentArray == null || contentArray == undefined) {
    contentArray = [];
  }
  else if (!Array.isArray(contentArray)) {
    contentArray = [contentArray];
  }

  const traceEvent = consts.TRACE_FLOW_RUNNER;
  hubUtils.hubTrace(traceEvent, `Processing content with flow ${flowName}; content array length: ${contentArray.length}`);

  const theFlow = Artifacts.getFullFlow(flowName);
  
  const databaseWriteQueue = {};
  const flowResponse = newFlowResponse(theFlow, jobId);

  let currentContentArray = contentArray;
  Object.keys(theFlow.steps).forEach(stepNumber => {
    const startDateTime = fn.currentDateTime().add(xdmp.elapsedTime());
    flowResponse.lastAttemptedStep = stepNumber;

    hubUtils.hubTrace(traceEvent, `Running step number ${stepNumber} in flow ${flowName}`);
    const stepExecutionContext = newStepExecutionContext(theFlow, stepNumber, jobId, runtimeOptions);
    currentContentArray = processContentWithStep(stepExecutionContext, currentContentArray, databaseWriteQueue);
    hubUtils.hubTrace(traceEvent, `Finished step number ${stepNumber} in flow ${flowName}`);

    flowResponse.lastCompletedStep = stepNumber;
    flowResponse.stepResponses[stepNumber] = stepExecutionContext.buildStepResponse(startDateTime);  
  });    

  persistWriteQueue(databaseWriteQueue);
  hubUtils.hubTrace(traceEvent, `Finished processing content with flow ${flowName}`);
  flowResponse.jobStatus = "finished";
  flowResponse.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
  return flowResponse;
}

function newFlowResponse(theFlow, jobId) {
  return {
    jobId,
    jobStatus: "started",
    flow: theFlow.name,
    user: xdmp.getCurrentUser(),
    timeStarted: fn.currentDateTime(),
    stepResponses: {}
  };
}

function newStepExecutionContext(theFlow, stepNumber, jobId, runtimeOptions) {
  const flowStep = theFlow.steps[stepNumber];
  const stepDefinition = findStepDefinition(theFlow.name, stepNumber, flowStep);
  return new StepExecutionContext(theFlow, stepNumber, stepDefinition, jobId, runtimeOptions);
}

/**
 * Ignoring provenance for now; ignoring invoking step against a different database for now
 *
 * @param stepExecutionContext
 * @param contentArray
 * @param databaseWriteQueue
 */
function processContentWithStep(stepExecutionContext, contentArray, databaseWriteQueue) {
  prepareContentBeforeStepIsRun(contentArray, stepExecutionContext);

  let outputContentArray = stepExecutionContext.stepModuleAcceptsBatch() ?
    runStepOnBatch(contentArray, stepExecutionContext) :
    runStepOnEachItem(contentArray, stepExecutionContext);

  // Copies regular flow behavior, where collections from options are added after the step module runs
  stepExecutionContext.addCollectionsFromOptionsToContentObjects(outputContentArray);
  addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, databaseWriteQueue);
  return outputContentArray;
}

/**
 * When a step has acceptsBatch=true, then the step module will be invoked once with the entire content array
 * passed to it.
 *
 * @param contentArray
 * @param stepExecutionContext
 * @return if an error occurs while processing the batch, in the step execution context and rethrown; else, 
 * the content array returned by the step is returned
 */
function runStepOnBatch(contentArray, stepExecutionContext) {
  const debugEnabled = xdmp.traceEnabled(consts.TRACE_FLOW_RUNNER_DEBUG);
  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const contentSequence = hubUtils.normalizeToSequence(contentArray);
  const outputContentArray = [];
  const batchItems = contentArray.map(content => content.uri);

  if (debugEnabled) {
    hubUtils.hubTrace(consts.DEBUG, `Running step on batch: ${xdmp.toJsonString(contentSequence)}`);
  }

  try {
    const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentSequence, stepExecutionContext.combinedOptions));
    for (const contentObject of outputSequence) {
      flowUtils.addMetadataToContent(contentObject, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
      if (debugEnabled) {
        hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER_DEBUG, `Returning content: ${xdmp.toJsonString(contentObject)}`);
      }
      outputContentArray.push(contentObject);
    }
    stepExecutionContext.setCompletedItems(batchItems);
  } catch (error) {
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Error while processing batch: ${error.message}`);
    stepExecutionContext.addErrorForEntireBatch(error, batchItems);
    throw error;
  }

  return outputContentArray;
}

/**
 * When a step does not have acceptsBatch=true, then the step module is invoked on each item in the content array.
 *
 * @param contentArray
 * @param stepExecutionContext
 * @return if an error occurs while processing an item, it is captured in the step execution context and rethrown; else, 
 * the content array returned by the step is returned
 */
function runStepOnEachItem(contentArray, stepExecutionContext) {
  const debugEnabled = xdmp.traceEnabled(consts.TRACE_FLOW_RUNNER_DEBUG);
  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const outputContentArray = [];
  contentArray.map(contentObject => {
    const thisItem = contentObject.uri;
    if (debugEnabled) {
      hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER_DEBUG, `Running step on content: ${xdmp.toJsonString(contentObject)}`);
    }
    try {
      const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentObject, stepExecutionContext.combinedOptions));
      for (const outputContent of outputSequence) {
        outputContent.previousUri = thisItem;
        flowUtils.addMetadataToContent(outputContent, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
        stepExecutionContext.addCompletedItem(thisItem);
        if (debugEnabled) {
          hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER_DEBUG, `Returning content: ${xdmp.toJsonString(contentObject)}`);
        }
        outputContentArray.push(outputContent);
      }
    } catch (error) {
      hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Error while processing item ${thisItem}: ${error.message}`);
      stepExecutionContext.addBatchError(error, thisItem);
      throw error;
    }
  });

  return outputContentArray;
}


/**
 * @param flowName needed for nice error messages
 * @param stepNumber needed for nice error messages
 * @param flowStep
 */
function findStepDefinition(flowName, stepNumber, flowStep) {
  const name = flowStep.stepDefinitionName;
  if (!name) {
    httpUtils.throwBadRequest(`stepDefinitionName not found in step '${stepNumber}' in flow '${flowName}'`);
  }
  const type = flowStep.stepDefinitionType;
  if (!type) {
    httpUtils.throwBadRequest(`stepDefinitionType not found in step '${stepNumber}' in flow '${flowName}'`);
  }
  const stepDef = new StepDefinition().getStepDefinitionByNameAndType(name, type);
  if (!stepDef) {
    let message = `stepDefinition not found for step '${stepNumber}' in flow '${flowName}';`;
    message += `name: '${name}'; type: '${type}'`;
    httpUtils.throwBadRequest(message);
  }
  return stepDef;
}

/**
 * Step modules and custom hooks expect content values to be document nodes.
 *
 * @param contentArray
 */
function prepareContentBeforeStepIsRun(contentArray, stepExecutionContext) {
  const options = stepExecutionContext.combinedOptions;
  const permissions = options.permissions ? hubUtils.parsePermissions(options.permissions) : null;
  contentArray.forEach(content => {
    if (content.value) {
      const valueNeedsToBeWrappedAsNode = "object" == xdmp.nodeKind(content.value);
      if (valueNeedsToBeWrappedAsNode) {
        content.value = xdmp.toJSON(content.value);
      }
    }

    // This copies what queryToContentDesciptorArray does with permissions
    if (!content.context) {
      content.context = {};
    } else if (content.context.permissions) {
      content.context.originalPermissions = content.context.permissions;
    }
    if (permissions) {
      content.context.permissions = permissions;
    }

    // This emulates what queryToContentDescriptor does, which does not set collections before a step
    // is run, but rather afterwards. If collections do exist from the queried document, they're instead
    // added under "originalCollections"
    if (content.context.collections) {
      content.context.originalCollections = content.context.collections;
      content.context.collections = [];
    }
  });
}

/**
 * @param stepExecutionContext
 * @param outputContentArray
 * @param databaseWriteQueue
 */
function addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, databaseWriteQueue) {
  const targetDatabase = stepExecutionContext.getTargetDatabase();
  let databaseContentMap = databaseWriteQueue[targetDatabase];
  if (!databaseContentMap) {
    databaseContentMap = {};
    databaseWriteQueue[targetDatabase] = databaseContentMap;
  }
  outputContentArray.forEach(contentObject => {
    if (contentObject.uri) {
      databaseContentMap[contentObject.uri] = copyContentObject(contentObject);
    }
  });
}

/**
 * Before a content object is added to the write queue, a copy needs to be made of it. This ensure that subsequent steps don't
 * modify the object that should be persisted. 
 * 
 * @param contentObject 
 */
function copyContentObject(contentObject) {
  // TODO We'll see if a shallow copy of contentObject.value holds up. For JSON, this works because the prepare
  // method calls xdmp.toJSON on it, thus creating a new node. For XML - we'll when we test custom steps, which may not create 
  // a new object the way a mapping step does. 
  // Note that JSON.parse/xdmp.quote was initially used; that works for JSON, but not for an XML content.value.
  // JSON.parse/stringify did not work when the content.value is a node, which it can be. 
  return {
    uri: contentObject.uri,
    value: contentObject.value,
    context: {
      collections: JSON.parse(xdmp.quote(contentObject.context.collections)),
      metadata: JSON.parse(xdmp.quote(contentObject.context.metadata)),
      permissions: JSON.parse(xdmp.quote(contentObject.context.permissions))
    }
  };
}

/**
 * TODO Once we do job data, we'll have to figure out what to do with multiple transaction IDs and timestamps,
 * as those aren't at the step level but rather at the batch level, and per database.
 *
 * TODO Add error handling. Each step may have succeeded, but the batch fails.
 */
function persistWriteQueue(databaseWriteQueue) {
  Object.keys(databaseWriteQueue).forEach(databaseName => {
    const databaseContent = databaseWriteQueue[databaseName];
    const contentArray = Object.keys(databaseContent).map(key => databaseContent[key]);
    flowUtils.writeContentArray(contentArray, databaseName);
  });
}

module.exports = {
  processContentWithFlow
}

