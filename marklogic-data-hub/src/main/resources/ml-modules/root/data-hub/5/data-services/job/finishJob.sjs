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

const Job = require("/data-hub/5/flow/job.sjs");
const dhProv = require('/data-hub/5/provenance/dh-provenance.xqy');
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

var jobId;
var jobStatus;

function updateJobProvenance(jobId, jobEndTime) {
  const options = {
    "endTime": jobEndTime
  }
  const provCollectionQuery = cts.collectionQuery("http://marklogic.com/provenance-services/record");
  const provIdAttributeQuery = cts.elementAttributeValueQuery(fn.QName("http://www.w3.org/ns/prov#", "activity"),
    fn.QName("http://www.w3.org/ns/prov#", "id"), fn.concat("job:", jobId));
  const jobProvQuery = cts.andQuery([provCollectionQuery, provIdAttributeQuery]);

  const stagingJobProvRecordUri = fn.head(
    hubUtils.invokeFunction(function () {
      return cts.uris("", null, jobProvQuery);
    }, config.STAGINGDATABASE)
  );

  let finalJobProvRecordUri = fn.head(
    hubUtils.invokeFunction(function () {
      return cts.uris("", null, jobProvQuery);
    }, config.FINALDATABASE)
  );

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
