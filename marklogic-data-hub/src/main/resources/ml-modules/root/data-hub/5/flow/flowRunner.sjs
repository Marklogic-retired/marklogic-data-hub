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
 * @param contentArray
 * @param jobId
 * @param runtimeOptions
 */
function processContentWithFlow(flowName, contentArray, jobId, runtimeOptions) {
  if (!flowName) {
    httpUtils.throwBadRequest(`Unable to process content; no flow name provided`);
  }
  if (!Array.isArray(contentArray)) {
    contentArray = [contentArray];
  }

  const traceEvent = consts.TRACE_FLOW_RUNNER;
  hubUtils.hubTrace(traceEvent, `Processing content with flow ${flowName}; content array length: ${contentArray.length}`);

  const theFlow = Artifacts.getFullFlow(flowName);
  const enhancedWriteQueue = {};
  const flowResponse = newFlowResponse(theFlow, jobId);

  // Iterate over all steps; we'll support a subset later
  let currentContentArray = contentArray;
  Object.keys(theFlow.steps).forEach(stepNumber => {
    const startDateTime = fn.currentDateTime().add(xdmp.elapsedTime());
    flowResponse.lastAttemptedStep = stepNumber;

    hubUtils.hubTrace(traceEvent, `Running step number ${stepNumber} in flow ${flowName}`);
    const stepExecutionContext = newStepExecutionContext(theFlow, stepNumber, jobId, runtimeOptions);
    currentContentArray = processContentWithStep(stepExecutionContext, currentContentArray, enhancedWriteQueue);
    hubUtils.hubTrace(traceEvent, `Finished step number ${stepNumber} in flow ${flowName}`);

    flowResponse.lastCompletedStep = stepNumber;
    flowResponse.stepResponses[stepNumber] = stepExecutionContext.buildStepResponse(startDateTime);
  });

  persistWriteQueue(enhancedWriteQueue);
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
 * @param enhancedWriteQueue
 */
function processContentWithStep(stepExecutionContext, contentArray, enhancedWriteQueue) {
  prepareContentBeforeStepIsRun(contentArray, stepExecutionContext);

  let outputContentArray = stepExecutionContext.stepModuleAcceptsBatch() ?
    runStepOnBatch(contentArray, stepExecutionContext) :
    runStepOnEachItem(contentArray, stepExecutionContext);

  // Copies regular flow behavior, where collections from options are added after the step module runs
  stepExecutionContext.addCollectionsFromOptionsToContentObjects(outputContentArray);
  addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, enhancedWriteQueue);
  return outputContentArray;
}

/**
 * When a step has acceptsBatch=true, then the step module will be invoked once with the entire content array
 * passed to it.
 *
 * @param contentArray
 * @param stepExecutionContext
 */
function runStepOnBatch(contentArray, stepExecutionContext) {
  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const contentSequence = hubUtils.normalizeToSequence(contentArray);
  const outputContentArray = [];
  const batchItems = contentArray.map(content => content.uri);
  if (xdmp.traceEnabled(consts.TRACE_FLOW_RUNNER_DEBUG)) {
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER_DEBUG, `Running step on items: ${xdmp.toJsonString(batchItems)}`);
  }

  try {
    const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentSequence, stepExecutionContext.combinedOptions));
    for (const outputContent of outputSequence) {
      addMetadataToContent(outputContent, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
      outputContentArray.push(outputContent);
    }
    stepExecutionContext.setCompletedItems(batchItems);
  } catch (error) {
    stepExecutionContext.addErrorForEntireBatch(error, batchItems);
  }
  return outputContentArray;
}

/**
 * When a step does not have acceptsBatch=true, then the step module is invoked on each item in the content array.
 *
 * @param contentArray
 * @param stepExecutionContext
 */
function runStepOnEachItem(contentArray, stepExecutionContext) {
  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const outputContentArray = [];
  contentArray.map(contentObject => {
    const thisItem = contentObject.uri;
    if (xdmp.traceEnabled(consts.TRACE_FLOW_RUNNER_DEBUG)) {
      hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER_DEBUG, `Running step on item: ${thisItem}`);
    }
    try {
      const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentObject, stepExecutionContext.combinedOptions));
      for (const outputContent of outputSequence) {
        outputContent.previousUri = thisItem;
        addMetadataToContent(outputContent, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
        stepExecutionContext.addCompletedItem(thisItem);
        outputContentArray.push(outputContent);
      }
    } catch (error) {
      stepExecutionContext.addBatchError(error, thisItem);
    }
  });
  return outputContentArray;
}


/**
 * TODO This should likely go into flowUtils once that's a library module and not a class.
 *
 * @param content
 * @param flowName
 * @param stepName
 * @param jobId
 */
function addMetadataToContent(content, flowName, stepName, jobId) {
  content.context = content.context || {};
  content.context.metadata = flowUtils.createMetadata(content.context.metadata || {}, flowName, stepName, jobId);

  if (content.context.collections) {
    content.context.collections = hubUtils.normalizeToArray(content.context.collections);
  }

  if (content.context.permissions) {
    content.context.permissions = hubUtils.normalizeToArray(content.context.permissions).map(perm => {
      if (perm instanceof Element) {
        const roleName = xdmp.roleName(fn.string(perm.xpath("*:role-id")));
        const capability = fn.string(perm.xpath("*:capability"));
        return xdmp.permission(roleName, capability);
      }
      return perm;
    });
  }
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
    if (content.value && "document" !== xdmp.nodeKind(content.value)) {
      content.value = xdmp.toJSON(content.value);
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
 * When a content object is added to the write queue, a deep copy must be made. That allows the content object
 * to be modified by subsequent steps without modifying what will be persisted as a particular step's output.
 *
 * @param stepExecutionContext
 * @param outputContentArray
 * @param enhancedWriteQueue
 */
function addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, enhancedWriteQueue) {
  const targetDatabase = stepExecutionContext.getTargetDatabase();
  let databaseContentMap = enhancedWriteQueue[targetDatabase];
  if (!databaseContentMap) {
    databaseContentMap = {};
    enhancedWriteQueue[targetDatabase] = databaseContentMap;
  }
  outputContentArray.forEach(contentObject => {
    if (contentObject.uri) {
      // parse/quote is used instead of parse/stringify to account for the fact that content.value may be a node
      // or may be an object with an embedded node. parse/stringify doesn't work on nodes, but parse/quote does.
      databaseContentMap[contentObject.uri] = JSON.parse(xdmp.quote(contentObject));
    }
  });
}

/**
 * TODO Once we do job data, we'll have to figure out what to do with multiple transaction IDs and timestamps,
 * as those aren't at the step level but rather at the batch level, and per database.
 *
 * TODO Add error handling. Each step may have succeeded, but the batch fails.
 */
function persistWriteQueue(enhancedWriteQueue) {
  Object.keys(enhancedWriteQueue).forEach(databaseName => {
    const databaseContent = enhancedWriteQueue[databaseName];
    const contentArray = Object.keys(databaseContent).map(key => databaseContent[key]);
    hubUtils.writeDocuments(contentArray, xdmp.defaultPermissions(), [], databaseName);
  });
}

module.exports = {
  addMetadataToContent,
  processContentWithFlow
}

