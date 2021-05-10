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

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");

/**
 * Captures state associated with the execution of a step.
 */
class StepExecutionContext {

  /**
   * Factory method for the normal approach of creating a step execution context, which uses data from the given 
   * flow execution context. For testing purposes, it is often easier to use the constructor directly.
   * 
   * @param flowExecutionContext
   * @param stepNumber 
   * @returns 
   */
  static newContext(flowExecutionContext, stepNumber) {
    const flow = flowExecutionContext.flow;
    const flowName = flow.name;
    if (!flow.steps || !flow.steps[stepNumber]) {
      httpUtils.throwBadRequest(`Cannot find step number '${stepNumber}' in flow '${flowName}`);
    }

    const flowStep = flow.steps[stepNumber];
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

    const context = new StepExecutionContext(flow, stepNumber, stepDef, flowExecutionContext.jobId, flowExecutionContext.getRuntimeOptions());
    context.flowExecutionContext = flowExecutionContext;
    return context;
  }

  /**
   * 
   * @param flow required; this must be a flow with inline steps
   * @param stepNumber required; the number of the step in the flow that is being executed
   * @param stepDefinition required; the step definition associated with the step being executed
   * @param jobId optional; the ID of the job associated with this step execution
   * @param runtimeOptions optional; used to construct the combinedOptions field
   */
  constructor(flow, stepNumber, stepDefinition, jobId, runtimeOptions = {}) {
    this.startDateTime = fn.currentDateTime().add(xdmp.elapsedTime());
    this.flow = flow;
    this.stepDefinition = stepDefinition;
    this.stepNumber = stepNumber;
    this.flowStep = flow.steps[stepNumber];
    this.jobId = jobId;
    this.throwStepError = false;

    this.combinedOptions = flowUtils.makeCombinedOptions(flow, stepDefinition, stepNumber, runtimeOptions);

    // This was moved here from flow.sjs; it's the original code for combining collections
    this.collectionsFromOptions = [
      runtimeOptions.collections,
      ((this.flowStep.options || {}).collections || (stepDefinition.options || {}).collections),
      (flow.options || {}).collections
    ]
      .reduce((previousValue, currentValue) => (previousValue || []).concat(currentValue || []))
      .filter(col => !!col); // filter out any null/empty collections that may exist

    this.completedItems = [];
    this.failedItems = [];
    this.stepErrors = [];
    this.stepOutputErrorMessages = undefined;
  }

  describe() {
    return `step ${this.stepNumber} in flow '${this.flow.name}'`;
  }

  getSourceDatabase() {
    return this.combinedOptions.sourceDatabase || config.STAGINGDATABASE;
  }

  /**
   * 
   * @returns {boolean} true if the sourceDatabase for this execution is the same as this transaction's database
   */
  sourceDatabaseIsCurrentDatabase() {
    const db = this.getSourceDatabase();
    return !db || db === xdmp.databaseName(xdmp.database());
  }

  getTargetDatabase() {
    return this.combinedOptions.targetDatabase || config.FINALDATABASE;
  }

  buildStepResponse() {
    const hasFailures = this.failedItems.length > 0;
    return {
      jobId: this.jobId,
      flowName: this.flow.name,
      stepName: this.flowStep.name,
      stepDefinitionName: this.stepDefinition.name,
      stepDefinitionType: this.stepDefinition.type,
      targetEntityType: this.flowStep.options.targetEntityType,
      targetDatabase: this.combinedOptions.targetDatabase,
      stepOutput: this.stepOutputErrorMessages,
      status: this.determineStepStatus(),
      totalEvents: this.failedItems.length + this.completedItems.length,
      successfulEvents: this.completedItems.length,
      failedEvents: this.failedItems.length,
      successfulBatches: !hasFailures && this.completedItems.length > 0 ? 1 : 0,
      failedBatches: hasFailures ? 1 : 0,
      success: !hasFailures,
      stepStartTime: this.startDateTime,
      stepEndTime: fn.currentDateTime().add(xdmp.elapsedTime())
    };
  }

  determineStepStatus() {
    if (this.failedItems.length > 0) {
      return this.completedItems.length > 0 ? "completed with errors step " + this.stepNumber : "failed step " + this.stepNumber;
    }
    return "completed step " + this.stepNumber;
  }

  /**
   * Adjusts the collections and permissions on each content object in the given array based on the combined options
   * and the user's default collections and permissions.
   * 
   * Since DHF 5.0, collections from options have been added after step processing as opposed to before 
   * step processing. This is contrary to permissions, which are set on content objects passed into a step. 
   * The history of this appears to be due to mastering steps, which create new content objects and thus 
   * want collections added to them, not to the content objects passed into a step. Thus, permissions are only 
   * adjusted based on the user's default permissions. This behavior may be changed in a future release of DHF 5.x, 
   * once we're able to determine what the "right" consistent behavior is.
   *
   * @param contentArray
   */
  finalizeCollectionsAndPermissions(contentArray) {
    this.applyTargetCollectionsAdditivity(contentArray);

    for (var contentObject of contentArray) {
      if (contentObject) {
        const context = contentObject.context || {};

        // Added in 5.5 to support mapping steps that can return many objects
        if (!context.useContextCollectionsOnly) {
          context.collections = this.collectionsFromOptions.concat(context.collections || []);
        }

        if (!context.collections || context.collections.length == 0) {
          context.collections = xdmp.defaultCollections().toArray();
        }

        if (!context.permissions || context.permissions.length == 0) {
          context.permissions = xdmp.defaultPermissions();
        }
      }
    }
  }

  applyTargetCollectionsAdditivity(contentArray) {
    if (String(this.combinedOptions.targetCollectionsAdditivity) == "true") {
      contentArray.forEach(content => {
        if (content.context.originalCollections) {
          let collections = content.context.collections || [];
          content.context.collections = collections.concat(content.context.originalCollections);
        }
      });
    }
  }  
  
  setCompletedItems(items) {
    // When a step is run with acceptsBatch=true, the step module may have captured step errors for one or more items.
    // So we need to deduplicate this with failedItems
    items.forEach(item => {
      if (!this.failedItems.includes(item)) {
        this.completedItems.push(item);
      }
    });
  }

  setFailedItems(items) {
    this.failedItems = items;
  }

  addCompletedItem(item) {
    this.completedItems.push(item);
  }

  /**
   * 
   * @param error 
   * @param batchItems 
   * @returns the constructed error object
   */
  addStepErrorForEntireBatch(error, batchItems) {
    this.failedItems = batchItems;
    this.completedItems = [];
    return this.addStepError(error, null);
  }

  stopWithError(error, batchItem) {
    this.stopped = true;
    return this.addStepError(error, batchItem);
  }

  /**
   * 
   * @returns {boolean} true if all the items were processed by the step, even if one or more failed
   */
  wasCompleted() {
    return this.stopped !== true && !this.determineStepStatus().startsWith("failed");
  }

  /**
   * 
   * @param error 
   * @param itemThatFailed {string} optional; used for when a step that processes each item individually has 
   * a failure for a particular item
   * @returns the constructed error object
   */
  addStepError(error, itemThatFailed) {
    // Object.assign doesn't work on an error object; gotta manually copy over each thing we care about
    const stepError = {};
    ["stack", "code", "data", "message", "name", "retryable", "stackFrames"].forEach(key => {
      if (error[key]) {
        stepError[key] = error[key];
      }
    });

    if (itemThatFailed) {
      stepError.uri = itemThatFailed;
    }

    // A user may either have job/batch data disabled and/or not see the flow response, so log the error
    // to ensure it is visible somewhere
    hubUtils.error(`Caught error while executing ${this.describe()}`, stepError);

    if (itemThatFailed != null) {
      this.failedItems.push(itemThatFailed);
    }

    if (error.message) {
      if (!this.stepOutputErrorMessages) {
        this.stepOutputErrorMessages = [];
      }
      this.stepOutputErrorMessages.push(error.message);
    }

    this.stepErrors.push(stepError);
    return stepError;
  }

  isStopOnError() {
    return this.combinedOptions.stopOnError === true;
  }
  
  getStepMainFunction() {
    const modulePath = this.stepDefinition.modulePath;
    const stepMainFunction = new StepDefinition().makeFunction(null, "main", modulePath);
    if (!stepMainFunction) {
      let message = `No 'main' function found for step number '${this.stepNumber} in flow '${this.flow.name}`;
      message += `; step definition module path: '${modulePath}'`;
      httpUtils.throwBadRequest(message);
    }
    return stepMainFunction;
  }

  stepModuleAcceptsBatch() {
    // Because acceptsBatch is tightly coupled to the step module, it would seem that the only place to configure
    // acceptsBatch would be the step definition. However, at least the mlSmMerge endpoint manually sets this via
    // combined options, so this still needs to check combinedOptions instead of just the step definition.
    return true == this.combinedOptions.acceptsBatch;
  }

  getBatchStatus() {
    if (this.failedItems.length > 0) {
      return this.completedItems.length > 0 ? "finished_with_errors" : "failed";
    }
    return "finished";
  }

  jobOutputIsEnabled() {
    return String(this.combinedOptions.disableJobOutput) !== "true";
  }

  provenanceIsEnabled() {
    const val = String(this.combinedOptions.provenanceGranularityLevel);
    return val === consts.PROVENANCE_COARSE || val === consts.PROVENANCE_FINE;
  }
  
  fineProvenanceIsEnabled() {
    return String(this.combinedOptions.provenanceGranularityLevel) === consts.PROVENANCE_FINE;
  }
  
  batchOutputIsEnabled() {
    if (!this.jobOutputIsEnabled()) {
      return false;
    }
    const value = this.combinedOptions.enableBatchOutput;
    if (value === "never") {
      return false;
    }
    if (value === "onFailure") {
      return this.failedItems.length > 0;
    }
    return true;
  }

  /**
   * @returns {boolean} true if throwStopError=true in the combined options. The default DHF approach for handling errors
   * is to capture them in the RunFlowResponse (and optionally Batch documents). But in a scenario where that response cannot be 
   * accessed - such as when running a step via MLCP - it is typically preferable for an error generated by a step to be thrown.
   */
  stepErrorShouldBeThrown() {
    return true == this.combinedOptions.throwStepError;
  }

  stepOutputShouldBeWritten() {
    return false !== this.combinedOptions.writeStepOutput;
  }

  /**
   * If custom hook config is found, returns a function that accepts an array of content objects. This is a change from DHF <= 5.4.x, where
   * the hook always received the input content array, even if it was an "after" hook. That actually worked for the most likely use case of 
   * attaching an after hook to a mapping step. That's because the mapping step returned the same content object it received. Now in 5.5, it 
   * returns new content objects, and potentially multiple ones due to related entity mappings. It seems far more intuitive that an after hook
   * should receive the output content array from a step, and could easily be considered a bug that it wasn't. 
   * 
   * @param {array} inputContentArray array of content objects being processed by this step; needed so that the set of items
   * being processed can be passed to the custom hook
   * @returns a function for executing the custom hook on an array of content objects
   */
  makeCustomHookRunner(inputContentArray) {
    const hookConfig = this.flowStep.customHook || this.stepDefinition.customHook;
    if (hookConfig && hookConfig.module) {
      const parameters = Object.assign({
        uris: inputContentArray.map(content => content.uri), 
        options: this.combinedOptions,
        flowName: this.flow.name,
        stepNumber: this.stepNumber,
        step: this.flowStep
      }, hookConfig.parameters);
      const user = hookConfig.user || xdmp.getCurrentUser();
      const database = hookConfig.runBefore ? this.getSourceDatabase() : this.getTargetDatabase();
      const options = flowUtils.buildInvokeOptionsForCustomHook(user, database);
      return {
        runBefore: hookConfig.runBefore,
        runHook: function(contentArray) {
          parameters.content = contentArray;
          const event = consts.TRACE_FLOW;
          if (xdmp.traceEnabled(event)) {
            if (hookConfig.runBefore) {
              hubUtils.hubTrace(event, `Running 'before' custom hook, module: ${hookConfig.module}`);
            } else {
              hubUtils.hubTrace(event, `Running 'after' custom hook, module: ${hookConfig.module}`);
            }
          }
          xdmp.invoke(hookConfig.module, parameters, options);
        }
      }
    }
    return null;
  }
}

module.exports = StepExecutionContext;
