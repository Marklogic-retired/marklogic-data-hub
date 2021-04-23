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

const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

/**
 * Encapsulates a Job object and provides convenience operations for updating the object and persisting it
 * to the jobs database.
 */
class Job {

  static newJob(flowName, jobId) {
    const job = jobs.buildNewJob(jobId, flowName);
    return new Job(job);
  }

  static getRequiredJob(jobId) {
    const job = jobs.getRequiredJob(jobId);
    return new Job(job);
  }

  constructor(job) {
    this.data = job;
  }

  create() {
    jobs.saveNewJob(this.data);
    return this.data;
  }

  update() {
    jobs.updateJob(this.data);
    return this.data;
  }

  startStep(stepNumber) {
    const stepStatus = "running step " + stepNumber;
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Starting step '${stepNumber}' of job '${this.data.job.jobId}'; setting job status to '${stepStatus}'`);
    this.data.job.lastAttemptedStep = stepNumber;
    this.data.job.jobStatus = stepStatus;
    this.data.job.stepResponses[stepNumber] = {
      stepStartTime: fn.currentDateTime(),
      status: stepStatus
    };
    return this;
  }
  
  finishStep(stepNumber, stepStatus, stepResponse, outputContentArray) {
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Finishing step '${stepNumber}' of job '${this.data.job.jobId}'; setting job status to '${stepStatus}'`);

    this.data.job.jobStatus = stepStatus;

    if (stepStatus.startsWith("completed")) {
      this.data.job.lastCompletedStep = stepNumber;
    }

    // Ensure stepStartTime is not modified from what it was originally set to
    stepResponse.stepStartTime = this.data.job.stepResponses[stepNumber].stepStartTime;

    // If stepEndTime has been set - such as for connected steps - don't overwrite it
    if (!stepResponse.stepEndTime) {
      stepResponse.stepEndTime = fn.currentDateTime();
    }

    jobs.createJobReport(this.data.job.jobId, stepNumber, stepResponse, outputContentArray);

    this.data.job.stepResponses[stepNumber] = stepResponse;
    return this;
  }

  finishJob(jobStatus, timeEnded) {
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Setting status of job '${this.data.job.jobId}' to '${jobStatus}'`);
    this.data.job.jobStatus = jobStatus;
    this.data.job.timeEnded = timeEnded;
    return this;
  }
}

module.exports = Job;
