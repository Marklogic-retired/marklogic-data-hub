'use strict';
declareUpdate();

const assertLib = require("/test/suites/data-hub/5/data-services/provenance/data-hub-provenance/lib/dh-prov-assert-lib.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const jobService = require("../../../lib/jobService.sjs");
const test = require("/test/test-helper.xqy");

function onStartStep(runTimeOptions) {
  const jobId = "verifyProvenanceRecordOnStartJob-jobId";
  const flowName = "simpleMappingFlow";
  const stepName = "mappingStep1";
  const stepNumber = "1";
  const targetEntityType = "http://example.org/Customer-0.0.1/Customer";

  xdmp.invokeFunction(function () {
    jobService.startJob(jobId, flowName);
    jobService.startStep(jobId, stepNumber, flowName, runTimeOptions);
  });

  const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
  assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
  assertLib.verifyStepAndEntityInProvenanceRecord(finalProvRecord, jobId, stepName, targetEntityType);
  test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));
}

function  onFinishJob(runTimeOptions) {
  const jobId = "verifyProvenanceRecordOnFinishJob-jobId";
  const flowName = "simpleMappingFlow";
  const stepName = "mappingStep1";
  const stepNumber = "1";
  const jobStatus = "finished";
  const targetEntityType = "http://example.org/Customer-0.0.1/Customer";
  xdmp.invokeFunction(function () {
    jobService.startJob(jobId, flowName);
    jobService.startStep(jobId, stepNumber, flowName, runTimeOptions);
    jobService.finishJob(jobId, jobStatus);
  });

  const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
  assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
  assertLib.verifyStepAndEntityInProvenanceRecord(finalProvRecord, jobId, stepName, targetEntityType);
  assertLib.verifyEndTimeInProvenanceRecord(finalProvRecord);
  test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));
}

module.exports = {
  onFinishJob,
  onStartStep
};

