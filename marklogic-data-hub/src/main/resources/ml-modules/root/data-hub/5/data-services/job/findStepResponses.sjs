'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/monitor-jobs", "execute");
const jobQueryLib = require("/data-hub/5/flow/job-query-lib.sjs");

var endpointConstants;

endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));
jobQueryLib.findStepResponses(endpointConstants);