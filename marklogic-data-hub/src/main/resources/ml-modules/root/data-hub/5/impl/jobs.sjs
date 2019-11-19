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

  getLastestJobDocPerFlow() {
    return this.hubutils.queryLatest(function(){
      let flowNames = cts.values(cts.jsonPropertyReference("flow"));
      let timeQuery = [];
      for(let flowName of flowNames) {
        let time = cts.values(cts.jsonPropertyReference("timeStarted"), null, ["descending","limit=1"], cts.jsonPropertyRangeQuery("flow", "=", flowName));
        timeQuery.push(cts.andQuery([cts.jsonPropertyRangeQuery("flow", "=", flowName), cts.rangeQuery(cts.jsonPropertyReference("timeStarted"), "=", time)]));
      }
      let results = cts.search(cts.orQuery(timeQuery));
      if(results) {
        return results.toArray();
      }
    }, this.config.JOBDATABASE);
  }

  getJobDocsForFlows(flowNames) {
    // Grab all the timeStarted values for each flow
    const tuples = cts.valueTuples(
      [
        cts.jsonPropertyReference("flow"),
        cts.jsonPropertyReference("timeStarted")
      ], [],
      cts.andQuery([
        cts.collectionQuery("Job"),
        cts.jsonPropertyRangeQuery("flow", "=", flowNames)
      ])
    );

    // Build a map of flowName to latestTime
    const timeMap = {};
    tuples.toArray().forEach(values => {
      const name = values[0];
      if (timeMap[name] == undefined) {
        timeMap[name] = values[1];
      }
      else {
        let latestTime = xs.dateTime(timeMap[name]);
        if (xs.dateTime(values[1]) > latestTime) {
          timeMap[name] = values[1];
        }
      }
    });

    // Build an array of queries for the latest job for each flow
    const queryArray = Object.keys(timeMap).map(flowName => {
      return cts.andQuery([
        cts.jsonPropertyRangeQuery("flow", "=", flowName),
        cts.jsonPropertyRangeQuery("timeStarted", "=", xs.dateTime(timeMap[flowName]))
      ])
    });

    // Find the latest jobs
    const latestJobs = cts.search(cts.andQuery([
      cts.collectionQuery("Job"),
      cts.orQuery(queryArray)
    ]));

    // Build a map of flow name to latest job for quick lookup
    const latestJobMap = {};
    latestJobs.toArray().forEach(job => {
      var obj = job.toObject();
      latestJobMap[obj.job.flow] = obj;
    });

    // Grab all the job IDs for the flow names
    // Could get these during the valueTuples call as well, but this is nice because it returns the values in a map
    const jobIdMap = cts.elementValueCoOccurrences(xs.QName("flow"), xs.QName("jobId"), ["map"], cts.andQuery([
      cts.collectionQuery("Job"),
      cts.jsonPropertyRangeQuery("flow", "=", flowNames)
    ]));

    // For each flow name, return its job IDs and latest job
    const response = {};
    if (flowNames != null && flowNames != undefined) {
      if (Array.isArray(flowNames)) {
        flowNames.forEach(flowName => {
          response[flowName] = {
            jobIds: jobIdMap[flowName],
            latestJob: latestJobMap[flowName]
          };
        });
      }
      else {
        response[flowNames] = {
          jobIds: jobIdMap[flowNames],
          latestJob: latestJobMap[flowNames]
        };
      }
    }

    return response;
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
    let requestTimestamp = xdmp.requestTimestamp();
    let reqTimeStamp = (requestTimestamp) ? xdmp.timestampToWallclock(requestTimestamp) : fn.currentDateTime();
    let batch = {
      batch: {
        jobId: jobId,
        batchId: this.hubutils.uuid(),
        step: step,
        stepNumber: stepNumber,
        batchStatus: "started",
        timeStarted:  fn.currentDateTime(),
        timeEnded: "N/A",
        hostName: xdmp.hostName(),
        reqTimeStamp: reqTimeStamp,
        reqTrnxID: xdmp.transaction(),
        writeTimeStamp: null,
        writeTrnxID: null,
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
      query.push(cts.jsonPropertyValueQuery("stepNumber", step));
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

  updateBatch(jobId, batchId, batchStatus, uris, writeTransactionInfo, error) {
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
      // Include the complete error so that this module doesn't have to have knowledge of everything that a step or flow
      // may add to the error, such as the URI of the failed document
      docObj.batch.completeError = error;
    }
    docObj.batch.writeTrnxID = writeTransactionInfo.transaction;
    docObj.batch.writeTimeStamp = writeTransactionInfo.dateTime;
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
