'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/monitor-jobs", "execute");
const jobQueryLib = require("/data-hub/5/flow/job-query-lib.sjs");

const endpointConstantsParam = external.endpointConstants;
var endpointConstants = endpointConstantsParam;

endpointConstants = fn.head(xdmp.fromJSON(endpointConstants));
jobQueryLib.findStepResponses(endpointConstants);
