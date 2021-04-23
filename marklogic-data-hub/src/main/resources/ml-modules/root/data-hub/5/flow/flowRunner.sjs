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
const consts = require("/data-hub/5/impl/consts.sjs");
const FlowExecutionContext = require("flowExecutionContext.sjs");
const flowProvenance = require("flowProvenance.sjs");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const prov = require("/data-hub/5/impl/prov.sjs");
const WriteQueue = require("/data-hub/5/flow/writeQueue.sjs");

const INFO_EVENT = consts.TRACE_FLOW_RUNNER;
const DEBUG_EVENT = consts.TRACE_FLOW_RUNNER_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

/**
 * Processes the given contentArray - a batch of content - against each step in the given flow. Each step
 * is run in-memory, with the output of one step becoming the input of the next step.
 *
 * @param {string} flowName
 * @param {array} contentArray array of objects conforming to ContentObject.schema.json; at a minimum, content.uri
 * must be specified
 * @param {string} jobId
 * @param {object} runtimeOptions
 * @param {array} stepNumbers optional array of the step numbers to run; if not specified, all steps are run
 * @return a JSON object conforming to RunFlowResponse.schema.json
 */
function processContentWithFlow(flowName, contentArray, jobId, runtimeOptions, stepNumbers) {
  let currentContentArray = normalizeContentArray(contentArray);
  runtimeOptions = runtimeOptions || {};

  hubUtils.hubTrace(INFO_EVENT, `Processing content with flow ${flowName}; content array length: ${currentContentArray.length}`);

  const writeQueue = new WriteQueue();
  const provInstance = new prov.Provenance();
  const flowExecutionContext = new FlowExecutionContext(Artifacts.getFullFlow(flowName), jobId, runtimeOptions, stepNumbers);
  let stepError;

  for (let stepNumber of flowExecutionContext.stepNumbers) {
    const stepExecutionContext = flowExecutionContext.startStep(stepNumber);
    const batchItems = currentContentArray.map(content => content.uri);
    
    try {
      prepareContentBeforeStepIsRun(currentContentArray, stepExecutionContext);

      currentContentArray = stepExecutionContext.sourceDatabaseIsCurrentDatabase() ? 
        processContentWithStep(stepExecutionContext, currentContentArray, writeQueue) : 
        fn.head(xdmp.invokeFunction(function() {
          return processContentWithStep(stepExecutionContext, currentContentArray, writeQueue);
        }, {database: xdmp.database(stepExecutionContext.getSourceDatabase())}));
      
      const stepResponse = stepExecutionContext.buildStepResponse(jobId);
      addFullOutputIfNecessary(stepExecutionContext, currentContentArray, stepResponse);
      if (stepExecutionContext.provenanceIsEnabled()) {
        flowProvenance.queueProvenanceData(stepExecutionContext, provInstance, currentContentArray);
      } else {
        hubUtils.hubTrace(INFO_EVENT, `Provenance is disabled for ${stepExecutionContext.getLabelForLogging()}`);
      }
      flowExecutionContext.finishStep(stepExecutionContext, stepResponse, batchItems, currentContentArray);
      hubUtils.hubTrace(INFO_EVENT, `Finished ${stepExecutionContext.getLabelForLogging()}`);
    } catch (error) {
      stepExecutionContext.addErrorForEntireBatch(error, batchItems);
      if (stepExecutionContext.stepErrorShouldBeThrown()) {
        throw error;
      }
      flowExecutionContext.finishStep(stepExecutionContext, stepExecutionContext.buildStepResponse(jobId), batchItems);
      stepError = error;
      break;
    }
  }

  // TODO Will improve error handling in DHFPROD-6720
  const writeInfos = !stepError ? writeQueue.persist() : null;
  provInstance.commit();
  flowExecutionContext.finishJob(stepError, writeInfos);
  return flowExecutionContext.flowResponse;
}

function normalizeContentArray(contentArray) {
  if (contentArray == null || contentArray == undefined) {
    return [];
  }
  return Array.isArray(contentArray) ? contentArray : [contentArray];
}

/**
 * TODO ignoring invoking step against a different database for now
 *
 * @param stepExecutionContext
 * @param contentArray
 * @param writeQueue
 */
function processContentWithStep(stepExecutionContext, contentArray, writeQueue) {
  const batchItems = contentArray.map(content => content.uri);

  const hookRunner = stepExecutionContext.makeCustomHookRunner(contentArray);
  if (hookRunner && hookRunner.runBefore) {
    hookRunner.runHook();
  }

  invokeBeforeMain(stepExecutionContext, contentArray);

  const outputContentArray = stepExecutionContext.stepModuleAcceptsBatch() ?
    runStepOnBatch(contentArray, stepExecutionContext) :
    runStepOnEachItem(contentArray, stepExecutionContext);

  // The behavior of an interceptor error being caught, and the custom hook still being run, is consistent with DHF 5.4.0
  // when interceptors were introduced
  const stepInterceptorError = applyInterceptorsBeforeContentPersisted(outputContentArray, stepExecutionContext, batchItems);

  if (hookRunner && !hookRunner.runBefore) {
    hookRunner.runHook();
  }

  // If an interceptor failed, none of the content objects processed by the step module should be written
  if (stepInterceptorError != null) {
    return [];
  }

  if (String(stepExecutionContext.combinedOptions.targetCollectionsAdditivity) == "true") {
    applyTargetCollectionsAdditivity(contentArray);
  }

  if (!stepExecutionContext.stepOutputShouldBeWritten()) {
    hubUtils.hubTrace(INFO_EVENT, `Not writing step output for ${stepExecutionContext.getLabelForLogging()}`);
  }
  else if (writeQueue != null) {
    // Since DHF 5.0, collections from options have been added after step processing as opposed to before step processing.
    // The reason for this is not known.
    stepExecutionContext.addCollectionsFromOptionsToContentObjects(outputContentArray);
    addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, writeQueue);
  }

  return outputContentArray;
}

function invokeBeforeMain(stepExecutionContext, contentArray) {
  // If the step module cannot be found, a friendly error will be thrown, which is why this is not included in the
  // try/catch block below
  const stepBeforeMainFunction = stepExecutionContext.getStepBeforeMainFunction();
  if (stepBeforeMainFunction) {
    try {
      hubUtils.hubTrace(INFO_EVENT, `Invoking beforeMain on step ${stepExecutionContext.getLabelForLogging()}`);
      const contentSequence = hubUtils.normalizeToSequence(contentArray);
      stepBeforeMainFunction(contentSequence, stepExecutionContext);
    } catch (error) {
      throw Error(`Unable to invoke beforeMain on ${stepExecutionContext.getLabelForLogging()}; cause: ${error.message}`);
    }
  }
}

function applyTargetCollectionsAdditivity(contentArray) {
  contentArray.forEach(content => {
    if (content.context.originalCollections) {
      let collections = content.context.collections || [];
      content.context.collections = collections.concat(content.context.originalCollections);
    }
  });
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
  const contentSequence = hubUtils.normalizeToSequence(contentArray);

  if (DEBUG_ENABLED) {
    hubUtils.hubTrace(DEBUG_EVENT, `Running step on batch: ${xdmp.toJsonString(contentSequence)}`);
  }

  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const outputContentArray = [];
  const batchItems = contentArray.map(content => content.uri);

  try {
    const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentSequence, stepExecutionContext.combinedOptions, stepExecutionContext));
    for (const outputContent of outputSequence) {
      flowUtils.addMetadataToContent(outputContent, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
      if (DEBUG_ENABLED) {
        hubUtils.hubTrace(DEBUG_EVENT, `Returning content: ${xdmp.toJsonString(outputContent)}`);
      }
      outputContentArray.push(outputContent);
    }
    stepExecutionContext.setCompletedItems(batchItems);
  } catch (error) {
    hubUtils.hubTrace(INFO_EVENT, `Error while processing batch: ${error.message}`);
    stepExecutionContext.addErrorForEntireBatch(error, batchItems);
    if (stepExecutionContext.stepErrorShouldBeThrown()) {
      throw error;
    }
  }

  return outputContentArray;
}

/**
 * When a step does not have acceptsBatch=true, then the step module is invoked on each item in the content array.
 *
 * @param contentArray
 * @param stepExecutionContext
 * @return if an error occurs while processing an item, it is captured in the step execution context; 
 *  the content array returned by the step is returned
 */
function runStepOnEachItem(contentArray, stepExecutionContext) {
  const stepMainFunction = stepExecutionContext.getStepMainFunction();
  const outputContentArray = [];
  contentArray.map(contentObject => {
    const thisItem = contentObject.uri;
    if (DEBUG_ENABLED) {
      hubUtils.hubTrace(DEBUG_EVENT, `Running step on content: ${xdmp.toJsonString(contentObject)}`);
    }
    try {
      const outputSequence = hubUtils.normalizeToSequence(stepMainFunction(contentObject, stepExecutionContext.combinedOptions, stepExecutionContext));
      if (fn.head(outputSequence)) {
        stepExecutionContext.addCompletedItem(thisItem);
        for (const outputContent of outputSequence) {
          outputContent.previousUri = thisItem;
          flowUtils.addMetadataToContent(outputContent, stepExecutionContext.flow.name, stepExecutionContext.flowStep.name, stepExecutionContext.jobId);
          if (DEBUG_ENABLED) {
            hubUtils.hubTrace(DEBUG_EVENT, `Returning content: ${xdmp.toJsonString(outputContent)}`);
          }
          outputContentArray.push(outputContent);
        }  
      }
    } catch (error) {
      hubUtils.hubTrace(INFO_EVENT, `Error while processing item ${thisItem}: ${error.message}`);
      stepExecutionContext.addBatchError(error, thisItem);
      if (stepExecutionContext.stepErrorShouldBeThrown()) {
        throw error;
      }
    }
  });

  return outputContentArray;
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
    }
  });
}

/**
 * @param stepExecutionContext
 * @param outputContentArray
 * @param writeQueue
 */
function addOutputContentToWriteQueue(stepExecutionContext, outputContentArray, writeQueue) {
  hubUtils.hubTrace(INFO_EVENT, `Adding output content objects to write queue for ${stepExecutionContext.getLabelForLogging()}`);
  const targetDatabase = stepExecutionContext.getTargetDatabase();
  outputContentArray.forEach(content => {
    const contentCopy = copyContentObject(content);
    writeQueue.addContent(targetDatabase, contentCopy, stepExecutionContext.flow.name, stepExecutionContext.stepNumber);
  });
}

/**
 * Effectively a copy constructor for a content object, with one exception - a shallow copy is used for content.value. This is based
 * on an assumption that the content.value will not be modified until another step tries to modify it, and by that point, the content.value
 * has been converted into a node (because that's what a step module expects). 
 * 
 * A shallow copy of content.value is also used because a reliable solution hasn't yet been found for a deep copy. JSON.parse/xdmp/quote was 
 * initially used; that works for JSON, not for an XML document. JSON.parse/JSON.stringify does not work when content.value is a node, which 
 * it can be. So until a reliable solution is found for a deep copy of content.value that works for JSON objects/nodes and for XML nodes, 
 * a shallow copy will be used. 
 * 
 * @param contentObject 
 */
function copyContentObject(contentObject) {
  const copy = {
    uri: contentObject.uri,
    value: contentObject.value,
    context: {}
  };

  Object.keys(contentObject).forEach(key => {
    if (key !== "context" && key !== "uri" && key !== "value") {
      // For anything DHF does not know about, just do a simple copy
      copy[key] = contentObject[key];
    }
  });

  const originalContext = contentObject.context || {};
  Object.keys(originalContext).forEach(key => {
    if (originalContext[key] && originalContext[key] !== null) {
      // All known context keys can be safely deep-copied
      // Note that per https://docs.marklogic.com/xdmp.documentSetMetadata , metadata keys always have string values
      if (key === "collections" || key === "metadata" || key === "permissions" || key === "originalCollections") {
        try {
          const quoted = xdmp.quote(originalContext[key]);
          if (quoted && quoted !== "") {
            copy.context[key] = JSON.parse(quoted);
          }
        } catch (error) {
          console.log("Copy error: " + error + "; uri: " + contentObject.uri + "; key: " + key);
        }
      }
      else {
        // For anything DHF does not know about it, just do a simple copy, as it's not know for certain if 
        // JSON.parse/xdmp.quote can be used
        copy.context[key] = originalContext[key];
      }
    }
  });

  return copy;
}

/**
 * Applies interceptors to the given content array. Interceptors can make any changes they wish to the items in the
 * content array, including adding and removing items, but the array itself cannot be changed - i.e. an interceptor may
 * not return a new instance of an array.
 * 
 * @param contentArray 
 * @param stepExecutionContext 
 * @returns if an error occurred, the error is returned
 */
function applyInterceptorsBeforeContentPersisted(contentArray, stepExecutionContext, batchItems) {
  const flowStep = stepExecutionContext.flowStep;
  if (flowStep.interceptors) {
    let currentInterceptor = null;
    try {
      flowStep.interceptors.filter((interceptor => "beforeContentPersisted" == interceptor.when)).forEach(interceptor => {
        currentInterceptor = interceptor;
        const vars = Object.assign({}, interceptor.vars);
        vars.contentArray = contentArray;
        vars.options = stepExecutionContext.combinedOptions;
        hubUtils.hubTrace(INFO_EVENT, `Invoking interceptor at path: ${interceptor.path}`);
        xdmp.invoke(interceptor.path, vars);
      });  
    } catch (error) {
      // If an interceptor throws an error, we don't know if it was specific to a particular item or not. So we assume that
      // all items failed; this is analogous to the behavior of acceptsBatch=true
      hubUtils.hubTrace(INFO_EVENT, `Caught error invoking interceptor at path: ${currentInterceptor.path}; error: ${error.message}`);
      stepExecutionContext.setCompletedItems([]);
      stepExecutionContext.addErrorForEntireBatch(error, batchItems);
      return error;
    }
  }
}

/**
 * 
 * @param stepExecutionContext 
 * @param outputContentArray 
 * @param stepResponse the step response associated with the stepNumber in stepExecutionContext
 */
function addFullOutputIfNecessary(stepExecutionContext, outputContentArray, stepResponse) {
  if (stepExecutionContext.combinedOptions.fullOutput === true) {
    // This follows the DHF 5.0 design where fullOutput is a map of URI to content object
    stepResponse.fullOutput = {};
    outputContentArray.forEach(contentObject => {
      // copyContentObject, which performs a shallow copy of content.value, is assumed to be safe here because if
      // content.value were to be modified, it would be done by a subsequent step. And it is assumed that content.value
      // will first be converted into a node before that step runs, since the step module functions require content.value
      // to be a node. 
      stepResponse.fullOutput[contentObject.uri] = copyContentObject(contentObject);
    });
  }  
}

module.exports = {
  copyContentObject,
  processContentWithFlow,
  processContentWithStep
}

