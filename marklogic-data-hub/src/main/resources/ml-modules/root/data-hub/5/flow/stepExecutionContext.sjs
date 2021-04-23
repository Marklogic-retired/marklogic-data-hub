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

    const context = new StepExecutionContext(flow, stepNumber, stepDef, flowExecutionContext.jobId, flowExecutionContext.runtimeOptions);
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

    // Copies what flow.sjs does for combining collections from options
    this.collectionsFromOptions = [
      runtimeOptions.collections,
      ((this.flowStep.options || {}).collections || (stepDefinition.options || {}).collections),
      (flow.options || {}).collections
    ]
    .reduce((previousValue, currentValue) => (previousValue || []).concat(currentValue || []))
    .filter(col => !!col); // filter out any null/empty collections that may exist

    this.completedItems = [];
    this.failedItems = [];
    this.batchErrors = [];
    this.stepOutputErrorMessages = undefined;
  }

  getLabelForLogging() {
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

  buildStepResponse(jobId) {
    const hasFailures = this.failedItems.length > 0;
    return {
      jobId,
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
   * "collections from options" refers to the array of collections built when this class was constructed.
   *
   * @param contentArray
   */
  addCollectionsFromOptionsToContentObjects(contentArray) {
    contentArray.forEach(contentObject => {
      if (contentObject) {
        if (!contentObject.context) {
          contentObject.context = {};
        }
        contentObject.context.collections = this.collectionsFromOptions.concat(contentObject.context.collections || []);
      }
    })
  }

  setCompletedItems(items) {
    this.completedItems = items;
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
  addErrorForEntireBatch(error, batchItems) {
    this.failedItems = batchItems;
    this.completedItems = [];
    return this.addBatchError(error, null);
  }

  /**
   * 
   * @param error 
   * @param batchItem 
   * @returns the constructed error object
   */
  addBatchError(error, batchItem) {
    // Object.assign doesn't work on an error object; gotta manually copy over each thing we care about
    const batchError = {
      "stack": error.stack,
      "code": error.code,
      "data": error.data,
      "message": error.message,
      "name": error.name,
      "retryable": error.retryable,
      "stackFrames": error.stackFrames,
      "uri": batchItem
    };

    // Temporary until DHFPROD-6720
    console.warn("Batch error!", batchError);
    
    if (batchItem != null) {
      this.failedItems.push(batchItem);
    }

    if (error.message) {
      if (!this.stepOutputErrorMessages) {
        this.stepOutputErrorMessages = [];
      }
      this.stepOutputErrorMessages.push(error.message);
    }

    this.batchErrors.push(batchError);
    return batchError;
  }

  getStepBeforeMainFunction() {
    const modulePath = this.stepDefinition.modulePath;
    return new StepDefinition().makeFunction(null, "beforeMain", modulePath);
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

  makeCustomHookRunner(contentArray) {
    const hookConfig = this.flowStep.customHook || this.stepDefinition.customHook;
    if (hookConfig && hookConfig.module) {
      const items = contentArray.map(content => content.uri);
      // DHF 5.0 established that a custom hook will receive content as a sequence
      const parameters = Object.assign({
        uris: items, 
        content: hubUtils.normalizeToSequence(contentArray),
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
        runHook: function() {
          const event = consts.TRACE_FLOW_RUNNER;
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
