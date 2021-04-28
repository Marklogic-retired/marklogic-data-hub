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

const Batch = require("batch.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const Job = require("job.sjs");
const StepExecutionContext = require("stepExecutionContext.sjs");

const INFO_EVENT = consts.TRACE_FLOW_RUNNER;

/**
 * Captures state associated with the execution of a flow. Provides methods for updating the flowResponse and, if job 
 * output is not disabled, the associated Job document.
 */
class FlowExecutionContext {

  /**
   * 
   * @param {object} flow The flow to execute
   * @param {string} jobId Optional job identifier; if not set, a UUID is used
   * @param {object} runtimeOptions Optional options to modify how the flow and steps are run
   * @param {array} stepNumbers Optional array of step numbers to execute; if not specified, all steps in the flow are run
   */
  constructor(flow, jobId, runtimeOptions, stepNumbers) {
    this.flow = flow;
    this.jobId = jobId;
    this.runtimeOptions = runtimeOptions || {};
    this.combinedFlowOptions = Object.assign({}, flow.options, this.runtimeOptions);
    this.stepNumbers = stepNumbers != null && stepNumbers.length > 0 ? stepNumbers : Object.keys(this.flow.steps);

    this.flowResponse = {
      jobId,
      jobStatus: "started",
      flow: flow.name,
      user: xdmp.getCurrentUser(),
      timeStarted: fn.currentDateTime(),
      stepResponses: {}
    };

    if (this.jobOutputIsEnabled) {
      this.job = Job.newJob(flow.name, jobId);
    }
  }

  describe() {
    return `flow '${this.flow.name}' and jobId '${this.jobId}'`;
  }

  jobOutputIsEnabled() {
    return String(this.combinedFlowOptions.disableJobOutput) !== "true";
  }

  startStep(stepNumber) {
    hubUtils.hubTrace(INFO_EVENT, `Starting step ${stepNumber} in flow '${this.flow.name}'`);
    const stepExecutionContext = StepExecutionContext.newContext(this, stepNumber);
    this.flowResponse.lastAttemptedStep = stepNumber;
    if (this.jobOutputIsEnabled()) {
      this.job.startStep(stepNumber);
    }
    return stepExecutionContext;
  }

  finishStep(stepExecutionContext, stepResponse, batchItems, outputContentArray) {
    const stepNumber = stepExecutionContext.stepNumber;
    if (stepExecutionContext.wasCompleted()) {
      this.flowResponse.lastCompletedStep = stepNumber;
    }
    this.flowResponse.stepResponses[stepNumber] = stepResponse;
    if (this.jobOutputIsEnabled()) {
      this.job.finishStep(stepNumber, stepResponse, null, outputContentArray);
      if (stepExecutionContext.batchOutputIsEnabled()) {
        if (this.batch == null) {
          this.batch = new Batch(this.flowResponse.jobId, this.flow.name);
        }
        this.batch.addStepResult(stepExecutionContext, batchItems);
      }
    }
    hubUtils.hubTrace(INFO_EVENT, `Finished ${stepExecutionContext.describe()}`);
  }

  addFlowError(error) {
    // The error has other keys, but the 3 below seem to suffice. stack/stackFrames both have a large amount of content that is 
    // unlikely to help with debugging. The main thing the user needs to see is what document failed and why did it fail; the 3 
    // keys below answer those questions.
    const flowError = {
      name: error.name,
      message: error.message,
      description: error.toString()
    };
    if (!this.flowResponse.flowErrors) {
      this.flowResponse.flowErrors = [flowError];
    } else {
      this.flowResponse.flowErrors.push(flowError);
    }
  }

  determineJobStatus() {
    if (this.flowResponse.flowErrors && this.flowResponse.flowErrors.length > 0) {
      return "finished_with_errors";
    }

    for (var key of Object.keys(this.flowResponse.stepResponses)) {
      const stepStatus = this.flowResponse.stepResponses[key].status;
      if (stepStatus) {
        if (stepStatus.startsWith("failed")) {
          return "failed";
        }
        if (stepStatus.startsWith("completed with errors")) {
          return "finished_with_errors";
        }  
      }
    }
    return "finished";
  }

  flowFailed() {
    return "failed" === this.determineJobStatus();
  }

  /**
   * Update the flowResponse and also save Job/Batch documents if enabled.
   * 
   * @param writeInfos 
   */
  finishAndSaveJob(writeInfos) {
    this.flowResponse.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
    this.flowResponse.jobStatus = this.determineJobStatus();

    if (this.job) {
      this.job.finishJob(
        this.flowResponse.jobStatus, this.flowResponse.timeEnded, this.flowResponse.flowErrors
      ).create();
    }

    if (this.batch) {
      this.batch.persist(writeInfos);
    }

    hubUtils.hubTrace(INFO_EVENT, `Finished processing content with flow ${this.flow.name}`);
  }
}

module.exports = FlowExecutionContext;