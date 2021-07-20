'use strict';
declareUpdate();

const assertLib = require("lib/dh-prov-assert-lib.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const jobService = require("../../lib/jobService.sjs");
const test = require("/test/test-helper.xqy");

const jobId = "verifyProvenanceRecordOnFinishJob-jobId";
const flowName = "simpleMappingFlow";
const stepNumber = "1";
const jobStatus = "finished";
xdmp.invokeFunction(function () {
  jobService.startJob(jobId, flowName, stepNumber);
  jobService.finishJob(jobId, jobStatus);
});

const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
assertLib.verifyEndTimeInProvenanceRecord(finalProvRecord);
test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));

