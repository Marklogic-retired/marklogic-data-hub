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

const config = require("/com.marklogic.hub/config.sjs");
const coreLib = require('/data-hub/5/artifacts/core.sjs');
const dhProv = require('/data-hub/5/provenance/dh-provenance.xqy');
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const Job = require("/data-hub/5/flow/job.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

var jobId;
var stepNumber;
var flowName;
var runTimeOptions;

function updateProvenance(flowName, stepNumber, jobId, runTimeOptions) {
  const stepDetails = fn.head(hubUtils.invokeFunction(function () {
    const fullFlow = coreLib.getFullFlow(flowName, stepNumber);
    return fullFlow["steps"][stepNumber];
  }, config.STAGINGDATABASE));

  const latestProvenance = stepDetails["options"]["latestProvenance"] || runTimeOptions["latestProvenance"];
  if(!latestProvenance) {
    return;
  }

  const targetDatabase = stepDetails["options"]["targetDatabase"];
  const stepName = stepDetails["name"];
  const targetEntityType = stepDetails["options"]["targetEntityType"];
  const options = {
    "stepName": stepName,
    "jobId": jobId,
    "targetEntityType": targetEntityType
  }

  let provRecordUri = jobs.findProvenanceRecordUriFromJobId(jobId, targetDatabase);
  if(!provRecordUri) {
    const job = jobs.getJob(jobId);
    const startDateTime = job["job"]["timeStarted"];
    const options = {
      "startDateTime": startDateTime,
      "user": xdmp.getCurrentUser()
    }
    const record = dhProv.newProvenanceRecord(jobId, options);
    provRecordUri = dhProv.insertProvenanceRecord(record, targetDatabase);
  }
  dhProv.updateStepInProvenanceRecord(provRecordUri, options, targetDatabase);
  if(targetEntityType) {
    dhProv.updateEntityInProvenanceRecord(provRecordUri, options, targetDatabase);
  }
}


const job = Job.getRequiredJob(jobId).startStep(stepNumber).update();
updateProvenance(flowName, stepNumber, jobId, runTimeOptions)
job
