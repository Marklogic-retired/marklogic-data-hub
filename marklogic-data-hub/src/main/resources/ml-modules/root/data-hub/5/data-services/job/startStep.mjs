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

import config from "/com.marklogic.hub/config.mjs";
import coreLib from "/data-hub/5/artifacts/core.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import Job from "/data-hub/5/flow/job.mjs";
import jobs from "/data-hub/5/impl/jobs.mjs";
import sjsProxy from "/data-hub/core/util/sjsProxy";

const dhProv = sjsProxy.requireSjsModule("/data-hub/5/provenance/dh-provenance.xqy");
const jobId = external.jobId;
const stepNumber = external.stepNumber;
const flowName = external.flowName;
const runTimeOptions = external.runTimeOptions;

function updateProvenance(stepDetails, jobId, runTimeOptions) {
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

const stepDetails = fn.head(hubUtils.invokeFunction(function () {
  const fullFlow = coreLib.getFullFlow(flowName, stepNumber);
  return fullFlow["steps"][stepNumber];
}, config.STAGINGDATABASE));

const job = Job.getRequiredJob(jobId).startStep(stepNumber, stepDetails).update();
updateProvenance(stepDetails, jobId, runTimeOptions);
job
