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
const Job = require("/data-hub/5/flow/job.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

var jobId;
var flowName;

// A user is allowed to reuse a jobId, in which case the existing job document will be overwritten.
// The updateJob function must be used in that scenario so that the amp associated with that function can be
// used to let the user overwrite the document.
if (jobs.getJob(jobId)) {
  hubUtils.hubTrace(consts.TRACE_FLOW, `Overwriting job '${jobId}' for flow '${flowName}'`);
  Job.newJob(flowName, jobId).update();
}
else {
  Job.newJob(flowName, jobId).create();
}
