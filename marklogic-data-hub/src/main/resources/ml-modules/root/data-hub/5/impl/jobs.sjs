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
// Batch documents can be cached because they should never be altered across transactions
const cachedBatchDocuments = {};

class Jobs {

  constructor(config = null, datahub = null) {
    if(!config) {
      config = require("/com.marklogic.hub/config.sjs");
    }
    this.config = config;
    this.jobsPermissions = `xdmp.defaultPermissions().concat([xdmp.permission('${config.FLOWDEVELOPERROLE}','update'),xdmp.permission('${config.FLOWOPERATORROLE}','update')])`;
    if (datahub) {
      this.hubutils = datahub.hubUtils;
    } else {
      const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
      this.hubutils = new HubUtils(config);
    }
  }

  createJob(flowName, id = null ) {
    let job = null;
    if(!id) {
     id = this.hubutils.uuid();
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
       timeEnded: "N/A",
       stepResponses :{}
     }
    };

    this.hubutils.writeDocument("/jobs/"+job.job.jobId+".json", job, this.jobsPermissions,  ['Jobs','Job'], this.config.JOBDATABASE);
    return job;
  }

  getJobDocWithId(jobId) {
    let jobUri = "/jobs/" + jobId + ".json";
    return fn.head(this.hubutils.queryLatest(function() {
        let jobDoc = cts.doc(jobUri);
        if (cts.contains(jobDoc, cts.jsonPropertyValueQuery("jobId", jobId))) {
          return jobDoc.toObject();
        }
      }, this.config.JOBDATABASE)
    );
  }

  getJobDocWithUri(jobUri) {
    return fn.head(this.hubutils.queryLatest(function() {
        if (xdmp.documentGetCollections(jobUri).includes("Job")) {
          return cts.doc(jobUri).toObject();
        }
      }, this.config.JOBDATABASE));
  }

  deleteJob(jobId) {
    let uris = cts.uris("", null ,cts.andQuery([cts.orQuery([cts.directoryQuery("/jobs/"),cts.directoryQuery("/jobs/batches/")]),
    cts.jsonPropertyValueQuery("jobId", jobId)]));
    for (let doc of uris) {
     if (fn.docAvailable(doc)){
       this.hubutils.deleteDocument(doc, this.config.JOBDATABASE);
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
    this.hubutils.writeDocument("/jobs/"+ jobId +".json", docObj, this.jobsPermissions, ['Jobs','Job'], this.config.JOBDATABASE);
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
    this.hubutils.queryLatest(function() {
      let uris = cts.uris("", null ,cts.andQuery(query));
      for (let doc of uris) {
        docs.push(cts.doc(doc).toObject());
      }
    }, this.config.JOBDATABASE);
    return docs;
  }

  getJobDocsByFlow(flowName) {
    return this.hubutils.queryLatest(function() {
      let query = [cts.collectionQuery('Job'),  cts.jsonPropertyValueQuery('flow', flowName, "case-insensitive")];
      let jobDoc = cts.search(cts.andQuery(query));
      if (jobDoc) {
        return jobDoc.toObject();
      }
    }, this.config.JOBDATABASE);
  }

  createBatch(jobId, step, stepNumber) {
    let batch = null;
    batch = {
      batch: {
        jobId: jobId,
        batchId: this.hubutils.uuid(),
        step: step,
        stepNumber: stepNumber,
        batchStatus: "started",
        timeStarted:  fn.currentDateTime(),
        timeEnded: "N/A",
        hostName: xdmp.hostName(),
        reqTimeStamp: xdmp.requestTimestamp(),
        reqTrnxID: xdmp.transaction(),
        writeTimeStamp: fn.currentDateTime(),
        writeTrnxID: xdmp.transaction(),
        uris:[]
      }
    };

    this.hubutils.writeDocument("/jobs/batches/" + batch.batch.batchId + ".json", batch , this.jobsPermissions, ['Jobs','Batch'], this.config.JOBDATABASE);
    return batch;
  }

  getBatchDocs(jobId, step=null) {
    let docs = [];
    let query = [cts.directoryQuery("/jobs/batches/"), cts.jsonPropertyValueQuery("jobId", jobId)];
    if (step) {
      query.push(cts.jsonPropertyValueQuery("step", step));
    }
    this.hubutils.queryLatest(function () {
      let uris = cts.uris("", null, cts.andQuery(query));
      for (let doc of uris) {
        docs.push(cts.doc(doc).toObject());
      }
    }, this.config.JOBDATABASE);
    return docs;
  }

  getBatchDocWithUri(batchUri) {
     return fn.head(this.hubutils.queryLatest(function() {
       if (xdmp.documentGetCollections(batchUri).includes("Batch")) {
         return cts.doc(batchUri).toObject();
       }
     }, this.config.JOBDATABASE));
  }

  updateBatch(jobId, batchId, batchStatus, uris, error) {
    let docObj = this.getBatchDoc(jobId, batchId);
    if(!docObj) {
      throw new Error("Unable to find batch document: "+ batchId);
    }
    docObj.batch.batchStatus = batchStatus;
    docObj.batch.uris = uris;
    if (batchStatus === "finished" || batchStatus === "finished_with_errors" || batchStatus === "failed") {
      docObj.batch.timeEnded = fn.currentDateTime();
    }
    if(error){
      // Sometimes we don't get the stackFrames
      if (error.stackFrames) {
        let stackTraceObj = error.stackFrames[0];
        docObj.batch.fileName = stackTraceObj.uri;
        docObj.batch.lineNumber = stackTraceObj.line;
      // If we don't get stackFrames, see if we can get the stack
      } else if (error.stack) {
        docObj.batch.errorStack = error.stack;
      }
      docObj.batch.error = `${error.name || error.code}: ${error.message}`;
    }
    let cacheId = jobId + "-" + batchId;
    cachedBatchDocuments[cacheId] = docObj;
    this.hubutils.writeDocument("/jobs/batches/"+ batchId +".json", docObj, this.jobsPermissions, ['Jobs','Batch'], this.config.JOBDATABASE);

  }

  getBatchDoc(jobId, batchId) {
    let cacheId = jobId + "-" + batchId;
    if (!cachedBatchDocuments[cacheId]) {
      let query = [cts.directoryQuery("/jobs/batches/"), cts.jsonPropertyValueQuery("jobId", jobId)
        , cts.jsonPropertyValueQuery("batchId", batchId)];
      cachedBatchDocuments[cacheId] = fn.head(this.hubutils.queryLatest(function () {
        let uri = cts.uris("", null, cts.andQuery(query));
        if (!fn.empty(uri)) {
          return cts.doc(uri).toObject();
        }
      }, this.config.JOBDATABASE));
    }
    return cachedBatchDocuments[cacheId];
  }
}

module.exports = Jobs;
