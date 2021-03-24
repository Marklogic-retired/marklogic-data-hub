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

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/run-step", "execute");

const consts = require('/data-hub/5/impl/consts.sjs');
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

var jobId;
var stepNumber;
var stepStatus;
var runStepResponse = fn.head(xdmp.fromJSON(runStepResponse));

const jobDoc = jobs.getRequiredJob(jobId);

hubUtils.hubTrace(consts.TRACE_JOB, `Finishing step '${stepNumber}' of job '${jobId}'; setting job status to '${stepStatus}'`);

jobDoc.job.jobStatus = stepStatus;

if (stepStatus.startsWith("completed")) {
  jobDoc.job.lastCompletedStep = stepNumber;
}

// Ensure stepStartTime is not modified from what it was originally set to
runStepResponse.stepStartTime = jobDoc.job.stepResponses[stepNumber].stepStartTime;

runStepResponse.stepEndTime = fn.currentDateTime();
jobDoc.job.stepResponses[stepNumber] = runStepResponse;

jobs.updateJob(jobDoc);

jobs.createJobReport(runStepResponse);

jobDoc;
