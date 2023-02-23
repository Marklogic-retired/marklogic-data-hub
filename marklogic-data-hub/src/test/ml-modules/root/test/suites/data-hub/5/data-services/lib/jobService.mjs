'use strict';
import config from "/com.marklogic.hub/config.mjs";

function invokeModule(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/job/" + module, args, {update: "true"}));
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
  return invokeModule("startJob.mjs", {jobId, flowName});
}

function finishJob(jobId, jobStatus) {
  return invokeModule("finishJob.mjs", {jobId, jobStatus});
}

function startStep(jobId, stepNumber, flowName, runTimeOptions) {
  return invokeModule("startStep.mjs", {jobId, stepNumber, flowName, runTimeOptions});
}

export default {
  findStepResponses,
  finishJob,
  getMatchingPropertyValues,
  startJob,
  startStep
};
