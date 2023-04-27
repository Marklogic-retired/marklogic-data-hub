'use strict';
import config from "/com.marklogic.hub/config.mjs";

function invokeModule(module, args, options = {}) {
  return fn.head(xdmp.invoke("/data-hub/data-services/job/" + module, args));
}

function findStepResponses(endpointConstants) {
  return fn.head(xdmp.invokeFunction(
      function() {
        return invokeModule("findStepResponses.mjs", {endpointConstants});
      },
      {database: xdmp.database(config.JOBDATABASE)}
  ));
}

function getMatchingPropertyValues(facetValuesSearchQuery) {
    return fn.head(xdmp.invokeFunction(
        function() {
            return invokeModule("getMatchingPropertyValues.mjs", {facetValuesSearchQuery});
        },
        {database: xdmp.database(config.JOBDATABASE)}
    ));
}

function startJob(jobId, flowName, stepNumber) {
  return invokeModule("startJob.mjs", {jobId, flowName}, {update: "true"});
}

function finishJob(jobId, jobStatus) {
  return invokeModule("finishJob.mjs", {jobId, jobStatus}, {update: "true"});
}

function startStep(jobId, stepNumber, flowName, runTimeOptions) {
  return invokeModule("startStep.mjs", {jobId, stepNumber, flowName, runTimeOptions}, {update: "true"});
}

export default {
  findStepResponses,
  finishJob,
  getMatchingPropertyValues,
  startJob,
  startStep
};
