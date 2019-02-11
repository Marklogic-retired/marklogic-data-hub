/**
  Copyright 2012-2019 MarkLogic Corporation

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
const HubUtils =  require("/data-hub/5/impl/hub-utils.sjs");
const hubutils = new HubUtils();

class Jobs {

  createJob(flowName, id = null ) {
    let job = null;
    if(id == null){
     id = xdmp.random();
    }
    job = {
     job: {
       jobId: id,
       flow: flowName,
       user: xdmp.getCurrentUser(),
       lastAttemptedStep: 0,
       lastCompletedStep: 0 ,
       jobStatus: "started" ,
       timeStarted:  fn.currentDateTime(),
       timeEnded: "N/A"
     }
    };

    hubutils.writeDocument("/jobs/"+job.job.jobId+".json", job, "'Jobs','Job'");
    return job;
  }

  getJobDocWithId(jobId) {
    let jobUri = "/jobs/" + jobId + ".json";
    if (cts.contains(cts.doc(jobUri), cts.jsonPropertyValueQuery("jobId",jobId))) {
      return this.getJobDocWithUri(jobUri);
    }
  }

  getJobDocWithUri(jobUri) {
    if (xdmp.documentGetCollections(jobUri).includes("Job")) {
      return cts.doc(jobUri).toObject();
    }
  }

  deleteJob(jobId) {
    let uris = cts.uris("", null ,cts.andQuery([cts.orQuery([cts.directoryQuery("/jobs/"),cts.directoryQuery("/jobs/batches/")]),
    cts.jsonPropertyValueQuery("jobId", jobId)]));
    for (let doc of uris) {
     if (fn.docAvailable(doc)){
       hubutils.deleteDocument(doc);
     }
    }
  }

  updateJob(jobId, lastAttemptedStep, lastCompletedStep, jobStatus) {
    let docObj = this.getJobDocWithId(jobId);
    if(!docObj) {
      throw new Error("Unable to find job document: "+ jobId);
    }
    docObj.job.lastAttemptedStep = lastAttemptedStep;
    docObj.job.lastCompletedStep = lastCompletedStep;
    docObj.job.jobStatus = jobStatus;
    if (jobStatus === "finished" || jobStatus === "finished_with_errors" || jobStatus === "failed"){
      docObj.job.timeEnded = fn.currentDateTime();
    }
    hubutils.writeDocument("/jobs/"+ jobId +".json", docObj, "'Jobs','Job'");
  }

  getLastStepAttempted(jobId) {
    let doc =  this.getJobDocWithId(jobId);
    if (doc){
      return doc.job.lastAttemptedStep;
    }
  }

  getLastStepCompleted(jobId) {
    let doc =  this.getJobDocWithId(jobId);
    if (doc){
      return doc.job.lastCompletedStep;
    }
  }

  getJobStatus(jobId) {
    let doc =  this.getJobDocWithId(jobId);
    if (doc){
      return doc.job.jobStatus;
    }
  }

  getJobDocs(status) {
    let docs = [];
    let query = [cts.directoryQuery("/jobs/"), cts.jsonPropertyWordQuery("jobStatus", status.toString().toLowerCase())];
    let uris = cts.uris("", null ,cts.andQuery(query));
    for (let doc of uris) {
      docs.push(cts.doc(doc).toObject());
    }
    return docs;
  }

  createBatch(jobId, processor, step) {
    let batch = null;
    batch = {
      batch: {
        jobId: jobId,
        batchId: xdmp.random(),
        processor: processor,
        step: step,
        batchStatus: "started",
        timeStarted:  fn.currentDateTime(),
        timeEnded: "N/A",
        uris:[]
      }
    };

    hubutils.writeDocument("/jobs/batches/" + batch.batch.batchId + ".json", batch , "'Jobs','Batch'");
    return jobId;
  }

  getBatchDocs(jobId, step=null) {
    let docs = [];
    let query = [cts.directoryQuery("/jobs/batches/"),cts.jsonPropertyValueQuery("jobId", jobId)];
    if(step != null) {
      query.push(cts.jsonPropertyValueQuery("step", step));
    }
    let uris = cts.uris("", null ,cts.andQuery(query));
    for (let doc of uris) {
      docs.push(cts.doc(doc).toObject());
    }
    return docs;
  }

  getBatchDocWithUri(batchUri) {
     if (xdmp.documentGetCollections(batchUri).includes("Batch")) {
       return cts.doc(batchUri).toObject();
     }
  }


  updateBatch(jobId, batchId, batchStatus, uris) {
    let docObj = this.getBatchDoc(jobId, batchId);
    if(!docObj) {
      throw new Error("Unable to find batch document: "+ batchId);
    }
    docObj.batch.batchStatus = batchStatus;
    docObj.batch.uris = uris;
    if (batchStatus === "finished" || batchStatus === "finished_with_errors" || batchStatus === "failed") {
      docObj.batch.timeEnded = fn.currentDateTime();
    }
    hubutils.writeDocument("/jobs/batches/"+ batchId +".json", docObj, "'Jobs','Batch'");
  }

  getBatchDoc(jobId, batchId) {
    let query = [cts.directoryQuery("/jobs/batches/"),cts.jsonPropertyValueQuery("jobId", jobId)
    ,cts.jsonPropertyValueQuery("batchId", batchId)];
    let uri = cts.uris("", null ,cts.andQuery(query));
    if(!fn.empty(uri)){
      return cts.doc(uri).toObject()
    }
  }
}

module.exports = Jobs;
