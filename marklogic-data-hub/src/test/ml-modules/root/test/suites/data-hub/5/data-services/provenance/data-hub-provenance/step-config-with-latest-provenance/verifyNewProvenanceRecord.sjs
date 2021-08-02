'use strict';

const provLib = require('/data-hub/5/provenance/dh-provenance.xqy');
const assertLib = require("/test/suites/data-hub/5/data-services/provenance/data-hub-provenance/lib/dh-prov-assert-lib.xqy");

const jobId = "verifyNewProvenanceRecord-jobId";
const recordOpts = {
  "startDateTime": fn.currentDateTime(),
  "user": xdmp.getCurrentUser()
}
const record = provLib.newProvenanceRecord(jobId, recordOpts);
assertLib.verifyNewProvenanceRecord(record, jobId);
