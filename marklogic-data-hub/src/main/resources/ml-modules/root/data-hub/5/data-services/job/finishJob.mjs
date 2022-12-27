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

import Job from "/data-hub/5/flow/job.mjs";
import config from "/com.marklogic.hub/config.mjs";
import jobs from "/data-hub/5/impl/jobs.mjs";
import sjsProxy from "/data-hub/core/util/sjsProxy";

const dhProv = sjsProxy.requireSjsModule("/data-hub/5/provenance/dh-provenance.xqy");

const jobId = external.jobId;
const jobStatus = external.jobStatus;

function updateJobProvenance(jobId, jobEndTime) {
  const options = {
    "endTime": jobEndTime
  }
  const stagingJobProvRecordUri = jobs.findProvenanceRecordUriFromJobId(jobId, config.STAGINGDATABASE);
  const finalJobProvRecordUri = jobs.findProvenanceRecordUriFromJobId(jobId, config.FINALDATABASE);

  if(stagingJobProvRecordUri) {
    dhProv.updateEndTimeInProvenanceRecord(stagingJobProvRecordUri, options, config.STAGINGDATABASE);
  }

  if(finalJobProvRecordUri) {
    dhProv.updateEndTimeInProvenanceRecord(finalJobProvRecordUri, options, config.FINALDATABASE);
  }
}

const jobEndTime = fn.currentDateTime();
const finishedJob = Job.getRequiredJob(jobId).finishJob(jobStatus, jobEndTime).update();
updateJobProvenance(jobId, jobEndTime);
finishedJob;
