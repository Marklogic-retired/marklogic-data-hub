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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const config = require("/com.marklogic.hub/config.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");

  function createJob(flowName, jobId = null ) {
    let job = null;
    if(!jobId) {
      jobId = sem.uuidString();
    }
    job = buildNewJob(jobId, flowName);
    hubUtils.writeDocument("/jobs/" + jobId + ".json", job, buildJobPermissions(), ['Jobs', 'Job'], config.JOBDATABASE);
    return job;
  }

  function buildNewJob(jobId, flowName) {
    return {
      job: {
        jobId: jobId,
        flow: flowName,
        user: xdmp.getCurrentUser(),
        lastAttemptedStep: 0,
        lastCompletedStep: 0 ,
        jobStatus: "started" ,
        timeStarted:  fn.currentDateTime(),
        stepResponses :{}
      }
    };
  }

  function buildJobPermissions() {
    let permissionsString = config.JOBPERMISSIONS;
    let permissions = xdmp.defaultPermissions().concat([xdmp.permission(config.FLOWDEVELOPERROLE, 'update'), xdmp.permission(config.FLOWOPERATORROLE, 'update')]);
    if (permissionsString != null && permissionsString.indexOf("mlJobPermissions") < 0) {
      let tokens = permissionsString.split(",");
      for (let i = 0; i < tokens.length; i += 2) {
        permissions.push(xdmp.permission(tokens[i], tokens[i + 1]));
      }
    }
    return permissions;
  }

  function getJob(jobId) {
    return getJobDocWithId(jobId, false);
  }

  /**
   * An error is thrown if a Job with the given jobId does not exist.
   *
   * @param jobId
   * @returns
   */
  function getRequiredJob(jobId) {
    return getJobDocWithId(jobId, true)
  }

  function getJobDocWithId(jobId, throwErrorIfMissing) {
    const jobUri = "/jobs/" + jobId + ".json";
    const jobDoc = fn.head(hubUtils.invokeFunction(function() {
        let doc = cts.doc(jobUri);
        if (cts.contains(doc, cts.jsonPropertyValueQuery("jobId", jobId))) {
          return doc.toObject();
        }
      }, config.JOBDATABASE)
    );
    if (!jobDoc && throwErrorIfMissing) {
      httpUtils.throwNotFound(`Unable to find Job document with ID: ${jobId}`);
    }
    return jobDoc;
  }

  function getJobDocs(status) {
    let docs = [];
    let query = [cts.directoryQuery("/jobs/"), cts.jsonPropertyWordQuery("jobStatus", status.toString().toLowerCase())];
    hubUtils.invokeFunction(function() {
      let uris = cts.uris("", null ,cts.andQuery(query));
      for (let doc of uris) {
        docs.push(cts.doc(doc).toObject());
      }
    }, config.JOBDATABASE);
    return docs;
  }

  function getJobDocsForFlows(flowNames) {
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

  function getJobDocsByFlow(flowName) {
    return hubUtils.invokeFunction(function() {
      let query = [cts.collectionQuery('Job'),  cts.jsonPropertyValueQuery('flow', flowName, "case-insensitive")];
      let jobDoc = cts.search(cts.andQuery(query));
      if (jobDoc) {
        return jobDoc.toObject();
      }
    }, config.JOBDATABASE);
  }

  /**
   * Create a Batch document in the jobs database. A Batch is intended to capture the set of items processed by
   * a given step.
   *
   * @param job the Job associated with this Batch. This is expected to be a JSON object with jobId as a key, rather
   * than the Job document that is persisted, which has "job" as its only key.
   * @param flowStep the step as defined in the flow being executed
   * @param stepNumber the number of the step as defined in the flow being executed
   * @returns {any}
   */
  function createBatch(job, flowStep, stepNumber) {
    let requestTimestamp = xdmp.requestTimestamp();
    let reqTimeStamp = (requestTimestamp) ? xdmp.timestampToWallclock(requestTimestamp) : fn.currentDateTime();

    const stepId = flowStep.stepId ? flowStep.stepId : flowStep.name + "-" + flowStep.stepDefinitionType;

    let batch = {
      batch: {
        jobId: job.jobId,
        batchId: sem.uuidString(),
        flowName: job.flow,
        stepId : stepId,
        step: flowStep,
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

    hubUtils.writeDocument(
      "/jobs/batches/" + batch.batch.batchId + ".json", batch, buildJobPermissions(), ['Jobs','Batch'], config.JOBDATABASE
    );

    return batch;
  }

  function getBatchDoc(jobId, batchId) {
    return fn.head(hubUtils.invokeFunction(function () {
      const batchDoc = fn.head(cts.search(
        cts.andQuery([
          cts.directoryQuery("/jobs/batches/"),
          cts.jsonPropertyValueQuery("jobId", jobId),
          cts.jsonPropertyValueQuery("batchId", batchId)
        ]), "unfiltered"
      ));
      return batchDoc ? batchDoc.toObject() : null;
    }, config.JOBDATABASE));
  }

  /**
   * This logic was originally in updateJob, and it was expected to be triggered when a step was finished.
   * The intent is to give a step a chance to perform some processing after all batches have been completed. Right
   * now, that logic is specific to the notion of a "job report", which is specific to the OOTB merging step. This
   * could certainly be generalized in the future to be a generic "after batches completed" function.
   *
   * @param stepResponse
   */
  function createJobReport(stepResponse) {
    if (stepResponse.stepDefinitionName && stepResponse.stepDefinitionType) {
      const stepDefinition = fn.head(hubUtils.invokeFunction(function () {
          return new StepDefinition().getStepDefinitionByNameAndType(stepResponse.stepDefinitionName, stepResponse.stepDefinitionType);
        }, config.FINALDATABASE
      ));

      let jobReportFunction = null;
      try {
        jobReportFunction = new StepDefinition().makeFunction(null, 'jobReport', stepDefinition.modulePath);
      } catch (e) {
        // If this function cannot be obtained, it is because the modulePath does not exist. No need to fail here;
        // a better error will be thrown later when the step is run and the module cannot be found.
      }

      if (jobReportFunction) {
        const flowStep = fn.head(hubUtils.invokeFunction(function () {
            return Artifacts.getFullFlow(stepResponse.flowName).steps[stepNumber];
          }, config.FINALDATABASE
        ));
        const options = Object.assign({}, stepDefinition.options, flowStep.options);
        const jobReport = fn.head(hubUtils.invokeFunction(function () {
            return jobReportFunction(jobId, stepResponse, options);
          },
          options.targetDatabase || config.FINALDATABASE
        ));
        if (jobReport) {
          hubUtils.writeDocument(
            `/jobs/reports/${stepResponse.flowName}/${stepNumber}/${jobId}.json`, jobReport,
            buildJobPermissions(), ['Jobs', 'JobReport'], config.JOBDATABASE
          );
        }
      }
    }
  }

module.exports = {
  buildJobPermissions,
  buildNewJob,
  createJob,
  createJobReport,
  createBatch,
  getJob,
  getJobDocs,
  getJobDocsByFlow,
  getJobDocsForFlows,
  getRequiredJob
}

/**
 * This function is amped to allow for the Job document to be updated by users that do not have the required
 * roles that permit doing so.
 */
module.exports.updateJob = module.amp(
  function updateJob(jobDoc) {
    const jobId = jobDoc.job.jobId;
    //console.log("updating: " + jobId + "; " + buildJobPermissions());
    hubUtils.writeDocument("/jobs/" + jobId + ".json", jobDoc, buildJobPermissions(), ['Jobs', 'Job'], config.JOBDATABASE);
    return null;
  }
);

module.exports.updateBatch = module.amp(
  function updateBatch(stepExecutionContext, items, writeTransactionInfo) {
    const jobId = stepExecutionContext.jobId;
    const batchId = stepExecutionContext.batchId;

    const docObj = getBatchDoc(jobId, batchId);
    if(!docObj) {
      throw new Error("Unable to find batch document: "+ batchId);
    }

    const batchStatus = stepExecutionContext.getBatchStatus();
    docObj.batch.batchStatus = batchStatus;
    docObj.batch.uris = items;

    const combinedOptions = stepExecutionContext.combinedOptions;

    // Only store this if the step wants it, so as to avoid storing this indexed data for steps that don't need it
    if (combinedOptions.enableExcludeAlreadyProcessed === true || combinedOptions.enableExcludeAlreadyProcessed === "true") {
      const flowStep = stepExecutionContext.flowStep;
      const flowName = stepExecutionContext.flow.name;
      const stepId = flowStep.stepId ? flowStep.stepId : flowStep.name + "-" + flowStep.stepDefinitionType;
      // stepId is lower-cased as DHF 5 doesn't guarantee that a step type is lower or upper case
      const prefix = flowName + "|" + fn.lowerCase(stepId) + "|" + batchStatus + "|";
      docObj.batch.processedItemHashes = items.map(item => xdmp.hash64(prefix + item));
    }

    if (batchStatus === "finished" || batchStatus === "finished_with_errors" || batchStatus === "failed") {
      docObj.batch.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
    }

    const error = stepExecutionContext.batchErrors[0];
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
    hubUtils.writeDocument("/jobs/batches/" + batchId + ".json", docObj, buildJobPermissions(), ['Jobs', 'Batch'], config.JOBDATABASE);
  });

