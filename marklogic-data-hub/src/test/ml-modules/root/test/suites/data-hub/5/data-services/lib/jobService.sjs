'use strict';
const config = require("/com.marklogic.hub/config.sjs");

function invokeModule(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/job/" + module, args));
}

function findStepResponses(endpointConstants) {
  return fn.head(xdmp.invokeFunction(
      function() {
        return invokeModule("findStepResponses.sjs", {endpointConstants});
      },
      {database: xdmp.database(config.JOBDATABASE)}
  ));
}

function getMatchingPropertyValues(facetValuesSearchQuery) {
    return fn.head(xdmp.invokeFunction(
        function() {
            return invokeModule("getMatchingPropertyValues.sjs", {facetValuesSearchQuery});
        },
        {database: xdmp.database(config.JOBDATABASE)}
    ));
}

function startJob(jobId, flowName, stepNumber) {
  return invokeModule("startJob.sjs", {jobId, flowName, stepNumber});
}

function finishJob(jobId, jobStatus) {
  return invokeModule("finishJob.sjs", {jobId, jobStatus});
}

module.exports = {
  findStepResponses,
  getMatchingPropertyValues,
  startJob,
  finishJob
};
