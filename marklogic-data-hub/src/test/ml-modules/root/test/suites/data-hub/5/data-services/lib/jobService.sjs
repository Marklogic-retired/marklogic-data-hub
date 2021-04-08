'use strict';
const config = require("/com.marklogic.hub/config.sjs");

function invokeFindStepResponsesModule(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/job/" + module, args));
}

function findStepResponses(endpointConstants) {
  return fn.head(xdmp.invokeFunction(
      function() {
        return invokeFindStepResponsesModule("findStepResponses.sjs", {endpointConstants});
      },
      {database: xdmp.database(config.JOBDATABASE)}
  ));
}

module.exports = {
  findStepResponses
};
