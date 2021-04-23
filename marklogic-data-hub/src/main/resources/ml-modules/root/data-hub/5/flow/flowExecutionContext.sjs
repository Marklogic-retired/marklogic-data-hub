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
const jobs = require("/data-hub/5/impl/jobs.sjs");
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
    this.flowResponse.lastCompletedStep = stepNumber;
    this.flowResponse.stepResponses[stepNumber] = stepResponse;
    if (this.jobOutputIsEnabled()) {
      this.job.finishStep(stepNumber, "completed step " + stepNumber, stepResponse, outputContentArray);
      if (stepExecutionContext.batchOutputIsEnabled()) {
        if (this.batch == null) {
          this.batch = new Batch(this.flowResponse.jobId, this.flow.name);
        }
        this.batch.addStepResult(stepExecutionContext, batchItems);
      }
    }
  }

  // TODO Will improve this error handling in DHFPRPOD-6720
  finishJob(stepError, writeInfos) {
    this.flowResponse.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
    if (stepError) {
      this.flowResponse.jobStatus = "failed";
    } else {
      this.flowResponse.jobStatus = "finished";
    }

    if (this.job) {
      this.job.finishJob(this.flowResponse.jobStatus, this.flowResponse.timeEnded).create();
    }

    if (this.batch) {
      this.batch.persist(writeInfos);
    }

    hubUtils.hubTrace(INFO_EVENT, `Finished processing content with flow ${this.flow.name}`);
  }
}

module.exports = FlowExecutionContext;