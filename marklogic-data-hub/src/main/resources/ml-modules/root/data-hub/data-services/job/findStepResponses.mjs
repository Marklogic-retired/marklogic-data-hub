'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/monitor-jobs", "execute");
import jobQueryLib from "/data-hub/5/flow/job-query-lib.mjs";

const endpointConstants = fn.head(xdmp.fromJSON(external.endpointConstants));
jobQueryLib.findStepResponses(endpointConstants);
