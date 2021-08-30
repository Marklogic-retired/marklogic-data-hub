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
const consts = require("/data-hub/5/impl/consts.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");

const XS_NAMESPACE = "http://www.w3.org/2001/XMLSchema";

/**
 *
 * @param flowName
 * @param jobId
 * @returns {object} the Job object (object, not a document node)
 */
function createJob(flowName, jobId = null ) {
  let job = null;
  if(!jobId) {
    jobId = sem.uuidString();
  }
  job = buildNewJob(jobId, flowName);
  saveNewJob(job);
  return job;
}

/**
 * Saves a newly constructed Job; use createJob to both construct and save a Job.
 *
 * @param job
 */
function saveNewJob(job) {
  const jobUri = "/jobs/" + job.job.jobId + ".json";
  if (xdmp.traceEnabled(consts.TRACE_FLOW)) {
    hubUtils.hubTrace(consts.TRACE_FLOW, `Inserting job document with URI '${jobUri}' for flow '${job.job.flow}'`);
  }
  hubUtils.writeDocument(jobUri, job, buildJobPermissions(), ['Jobs', 'Job'], config.JOBDATABASE);
}

  function buildNewJob(jobId, flowName) {
    return {
      job: {
        jobId: jobId,
        flow: flowName,
        user: xdmp.getCurrentUser(),
        lastAttemptedStep: "0",
        lastCompletedStep: "0",
        jobStatus: "started",
        timeStarted:  fn.currentDateTime(),
        stepResponses :{}
      }
    };
  }

  function buildJobPermissions() {
    let permissionsString = config.JOBPERMISSIONS;
    let permissions = xdmp.defaultPermissions().concat([
      xdmp.permission(config.FLOWDEVELOPERROLE, "update"),
      xdmp.permission(config.FLOWOPERATORROLE, "update"),
      xdmp.permission("data-hub-job-internal", "update"),
      xdmp.permission("data-hub-job-internal", "read"),
      xdmp.permission("data-hub-job-reader", "read")
    ]);
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
   * A job with a given jobId is returned and additional metadata is added.
   *
   * @param jobId
   * @returns
   */
  function getJobWithDetails(jobId) {
    let job = getJobDocWithId(jobId, false);
    if (job) {
      if (xdmp.castableAs(XS_NAMESPACE, "dateTime", job.job.timeStarted)) {
        const timeStarted = xs.dateTime(job.job.timeStarted);
        // Determine if related flow or have been updated
        job.job.flowOrStepsUpdatedSinceRun = flowHasBeenUpdatedSince(job.job.flow, timeStarted);
        if (xdmp.castableAs(XS_NAMESPACE, "dateTime", job.job.timeEnded)) {
          // Calculate the duration
          job.job.duration = xs.dateTime(job.job.timeEnded).subtract(timeStarted);
        }
      }
    }
    return job;
  }


  function flowHasBeenUpdatedSince(flowName, dateTime) {
    try {
      const fullFlow = fn.head(hubUtils.invokeFunction(function () {
            return Artifacts.getFullFlow(flowName);
          }, config.FINALDATABASE
      ));
      const steps = fullFlow.steps;
      const stepValues = Object.keys(steps).map(step => steps[step]);
      const allArtifacts = [fullFlow].concat(stepValues);
      return allArtifacts.some((artifact) => {
        if (xdmp.castableAs(XS_NAMESPACE, "dateTime", artifact.lastUpdated)) {
          return xs.dateTime(artifact.lastUpdated).gt(dateTime);
        }
      });
    } catch (e) {
      // the flow no longer exists
      return true;
    }
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
   * This logic was originally in updateJob, and it was expected to be triggered when a step was finished.
   * The intent is to give a step a chance to perform some processing after all batches have been completed. Right
   * now, that logic is specific to the notion of a "job report", which is specific to the OOTB merging step. This
   * could certainly be generalized in the future to be a generic "after batches completed" function.
   *
   * @param jobId
   * @param stepNumber
   * @param {object} stepResponse
   * @param {array} outputContentArray optional; will be passed to jobReport function
   * @param {object} writeQueue optional; if not null, the job report is added to this; otherwise, the job report is 
   * written to the jobs database by this function
   */
  function createJobReport(jobId, stepNumber, stepResponse, outputContentArray, writeQueue) {
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
            return jobReportFunction(jobId, stepResponse, options, outputContentArray);
          },
          options.targetDatabase || config.FINALDATABASE
        ));

        if (jobReport) {
          const reportUri = `/jobs/reports/${stepResponse.flowName}/${stepNumber}/${jobId}.json`;
          const collections = ['Jobs', 'JobReport'];
          const permissions = buildJobPermissions();
          if (writeQueue) {
            hubUtils.hubTrace(consts.TRACE_FLOW, `Adding job report to write queue, URI: ${reportUri}`);
            const content = {uri: reportUri, value: jobReport, context: {collections, permissions}};
            writeQueue.addContent(config.JOBDATABASE, content, stepResponse.flowName, stepNumber);
          } else {
            hubUtils.hubTrace(consts.TRACE_FLOW, `Inserting job report with URI: ${reportUri}`);
            hubUtils.writeDocument(reportUri, jobReport, permissions, collections, config.JOBDATABASE);
          }  
        }
      }
    }
  }

module.exports = {
  buildJobPermissions,
  buildNewJob,
  createJob,
  createJobReport,
  getJob,
  getJobWithDetails,
  getJobDocs,
  getJobDocsByFlow,
  getJobDocsForFlows,
  getRequiredJob,
  saveNewJob
}

/**
 * This function is amped to allow for the Job document to be updated by users that do not have the required
 * roles that permit doing so.
 */
module.exports.updateJob = module.amp(
  /**
   * Only updates the document, does not make any modifications to it, so nothing is returned.
   *
   * @param jobDoc
   * @returns
   */
  function updateJob(jobDoc) {
    const jobId = jobDoc.job.jobId;
    const jobUri = "/jobs/" + jobId + ".json";
    if (xdmp.traceEnabled(consts.TRACE_FLOW)) {
      hubUtils.hubTrace(consts.TRACE_FLOW, `Updating job document with URI '${jobUri}`);
    }
    hubUtils.writeDocument(jobUri, jobDoc, buildJobPermissions(), ['Jobs', 'Job'], config.JOBDATABASE);
    return null;
  }
);

module.exports.deleteJobs = module.amp(
  /**
   * Delete all job and batch document URIs passed in.
   *
   * @param jobDocumentURIs URIs of job documents to delete.
   *
   */
  function deleteJobs(jobDocumentURIs) {
    xdmp.securityAssert("http://marklogic.com/data-hub/privileges/delete-jobs", "execute");
    for (let uri of jobDocumentURIs) {
      xdmp.documentDelete(uri);
    }
  });
