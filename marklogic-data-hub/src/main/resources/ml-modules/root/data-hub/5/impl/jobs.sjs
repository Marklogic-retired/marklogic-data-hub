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
const hubutils = require("/data-hub/5/impl/hub-utils.sjs");

function createJob(flowName, id = null ) {
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

function getJobDocWithId(jobId) {
  let jobUri = "/jobs/" + jobId + ".json";
  return getJobDocWithUri(jobUri);
}

function getJobDocWithUri(jobUri) {
    if (xdmp.documentGetCollections(jobUri).includes("Job")) {
      return cts.doc(jobUri).toObject();
    }
    return null;
}

function deleteJob(jobId) {
  if (!getJobDocWithId(jobId)){
     return false;
  }
  let uris = cts.uris("", null ,cts.andQuery([cts.orQuery([cts.directoryQuery("/jobs/"),cts.directoryQuery("/jobs/batches/")]),
  cts.jsonPropertyValueQuery("jobId", jobId)]));
  for (let doc of uris) {
    if (fn.docAvailable(doc)){
      hubutils.deleteDocument(doc);
    }
  }
  return true;
}

function updateJob(jobId, lastAttemptedStep, lastCompletedStep, jobStatus) {
  const doc = getJobDoc(jobId);
  let docObj = doc.toObject();
  docObj.job.lastAttemptedStep = lastAttemptedStep;
  docObj.job.lastCompletedStep = lastCompletedStep;
  docObj.job.jobStatus = jobStatus;
  if (jobStatus === "finished" || jobStatus === "finished_with_errors" || jobStatus === "failed"){
    docObj.job.timeEnded = fn.currentDateTime();
  }
  hubutils.writeDocument("/jobs/"+ jobId +".json", docObj, "'Jobs','Job'");
}

function getLastStepAttempted(jobId) {
  let doc =  getJobDocWithId(jobId);
  if (doc){
    return doc.job.lastAttemptedStep;
  }
}

function getLastStepCompleted(jobId) {
  let doc =  getJobDocWithId(jobId);
  if (doc){
    return doc.job.lastCompletedStep;
  }
}

function getJobStatus(jobId) {
  let doc =  getJobDocWithId(jobId);
  if (doc){
    return doc.job.jobStatus;
  }
}

function createBatch(jobId, processor, step) {
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

function getBatchDocs(jobId, step=null) {
  let docs = [];
  let query = [cts.directoryQuery("/jobs/batches/"),cts.jsonPropertyValueQuery("jobId", jobId)];
  if(step != null) {
    query.push(cts.jsonPropertyValueQuery("step", step));
  }
  let uris = cts.uris("", null ,cts.andQuery(query));
  for (let doc of uris) {
    docs.push(cts.doc(doc).toObject());
  }
  return Sequence.from(docs);
}



function updateBatch(batchId, batchStatus, uris) {
  let docObj = getBatchDoc(batchId);
  docObj.batch.batchStatus = batchStatus;
  docObj.batch.uris = uris;
   if (batchStatus === "finished" || batchStatus === "finished_with_errors" || batchStatus === "failed"){
    docObj.batch.timeEnded = fn.currentDateTime();
  }
  hubutils.writeDocument("/jobs/batches/"+ batchId +".json", docObj, "'Jobs','Batch'");
}


function getBatchDoc(batchId) {
  let batchUri = "/jobs/batches/" + batchId + ".json";
  if (xdmp.documentGetCollections(batchUri).includes("Batch")) {
    return cts.doc(batchUri).toObject();
  }
}

//REST
function getBatchUris(jobId, batchId) {
  let query = [cts.directoryQuery("/jobs/batches/"),cts.jsonPropertyValueQuery("jobId", jobId), cts.jsonPropertyValueQuery("batchId", batchId)];
  let res = {};
  let uris = cts.uris("", null ,cts.andQuery(query));
  for (let doc of uris) {
    res[batchId] = cts.doc(doc).toObject().batch.uris;
  }
  return res;
}

//REST- getBatchStatus(String jobId, String step)
function getBatchStatus(jobId, batchId, step) {
  let query = [cts.directoryQuery("/jobs/batches/"),cts.jsonPropertyValueQuery("jobId", jobId), cts.jsonPropertyValueQuery("step", step)
  ,cts.jsonPropertyValueQuery("batchId", batchId)];
  let res = {};
  let uris = cts.uris("", null ,cts.andQuery(query));
  for (let doc of uris) {
    res[batchId] = cts.doc(doc).toObject().batch.batchStatus;
  }
  return res;
}

//REST
function getJobStatusRest(jobId) {
  let res = {};
  if(getJobDocWithId(jobId)){
    res[jobId] = getJobStatus(jobId);
  }
  return res;
}

//REST
function getJobsStatus(status) {
  let runningJobs = {};
  for (const doc of  cts.uris("", null ,cts.andQuery([cts.directoryQuery("/jobs/"), cts.jsonPropertyWordQuery("jobStatus", status.toLowerCase())]))){
    let id = cts.doc(doc).toObject().job.jobId;
    let status = cts.doc(doc).toObject().job.jobStatus;
    runningJobs[id] = status;
  }
  return runningJobs;
}

module.exports = {
  createJob:createJob,
  getJobDocWithId:getJobDocWithId,
  getJobDocWithUri:getJobDocWithUri,
  deleteJob:deleteJob,
  updateJob:updateJob,
  getJobStatus:getJobStatus,
  getJobsStatus:getJobsStatus,
  getBatchDocs:getBatchDocs,
  createBatch:createBatch,
  updateBatch:updateBatch,
  getBatchDoc:getBatchDoc,
  getLastStepAttempted:getLastStepAttempted,
  getLastStepCompleted:getLastStepCompleted,
  getJobStatusRest:getJobStatusRest,
  getBatchStatus:getBatchStatus,
  getBatchUris,getBatchUris
};
