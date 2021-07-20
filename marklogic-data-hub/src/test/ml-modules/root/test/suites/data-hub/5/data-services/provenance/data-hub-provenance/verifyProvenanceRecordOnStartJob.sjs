'use strict';
declareUpdate();

const assertLib = require("lib/dh-prov-assert-lib.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const jobService = require("../../lib/jobService.sjs");
const test = require("/test/test-helper.xqy");

const jobId = "verifyProvenanceRecordOnStartJob-jobId";
const flowName = "simpleMappingFlow";
const stepNumber = "1";
xdmp.invokeFunction(function () {
  jobService.startJob(jobId, flowName, stepNumber);
});
const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));

