'use strict';

const core = require('/data-hub/5/mapping-functions/core-functions.xqy');

function customDateTime(value, pattern) {
  return core.parseDateTime(value, pattern);
}


// Adding this function tests the scenario detailed in https://project.marklogic.com/jira/browse/DHFPROD-8027
function customReturningArray(value, pattern) {
  return ["test"];
}

module.exports = {
  customDateTime,
  customReturningArray
};
