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

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");

class StepExecutionContext {
  constructor(theFlow, stepNumber, stepDefinition, jobId, runtimeOptions) {
    this.flow = theFlow;
    this.stepDefinition = stepDefinition;
    this.stepNumber = stepNumber;
    this.flowStep = theFlow.steps[stepNumber];
    this.jobId = jobId;

    runtimeOptions = runtimeOptions || {};
    this.combinedOptions = Object.assign({}, stepDefinition.options, theFlow.options, this.flowStep.options, runtimeOptions);

    // Copies what flow.sjs does for combining collections from options
    this.collectionsFromOptions = [
      runtimeOptions.collections,
      ((this.flowStep.options || {}).collections || (stepDefinition.options || {}).collections),
      (theFlow.options || {}).collections
    ]
    .reduce((previousValue, currentValue) => (previousValue || []).concat(currentValue || []))
    .filter(col => !!col); // filter out any null/empty collections that may exist

    this.completedItems = [];
    this.failedItems = [];
    this.batchErrors = [];
    this.stepOutputErrorMessages = undefined;
  }

  buildStepResponse(startDateTime) {
    const hasFailures = this.failedItems.length > 0;
    const stepResponse = {
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
      stepStartTime: startDateTime,
      stepEndTime: fn.currentDateTime().add(xdmp.elapsedTime())
    };
    return stepResponse;
  }

  // No concept of "stopped" yet
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

  addErrorForEntireBatch(error, batchItems) {
    this.failedItems = batchItems;
    this.completedItems = [];
    this.addBatchError(error, null);
  }

  addBatchError(error, batchItem) {
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

    if (!batchItem) {
      this.failedItems.push(batchItem);
    }

    if (error.message) {
      if (!this.stepOutputErrorMessages) {
        this.stepOutputErrorMessages = [];
      }
      this.stepOutputErrorMessages.push(error.message);
    }

    this.batchErrors.push(batchError);
  }

  getTargetDatabase() {
    return this.combinedOptions.targetDatabase;
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
    return this.stepDefinition.acceptsBatch;
  }
}

module.exports = StepExecutionContext;