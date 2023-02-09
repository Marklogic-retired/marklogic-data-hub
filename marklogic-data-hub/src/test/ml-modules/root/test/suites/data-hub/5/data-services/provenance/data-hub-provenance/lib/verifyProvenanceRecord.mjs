'use strict';
import hubTest from "/test/data-hub-test-helper.mjs";
import jobService from "../../../lib/jobService.mjs";

const assertLib = require("/test/suites/data-hub/5/data-services/provenance/data-hub-provenance/lib/dh-prov-assert-lib.xqy");
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

  xdmp.invokeFunction(function () {
    const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
    assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
    assertLib.verifyStepAndEntityInProvenanceRecord(finalProvRecord, jobId, stepName, targetEntityType);
    test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));
  });
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

  xdmp.invokeFunction(function () {
    const finalProvRecord = assertLib.queryProvenanceRecord(jobId);
    assertLib.verifyNewProvenanceRecord(finalProvRecord, jobId);
    assertLib.verifyStepAndEntityInProvenanceRecord(finalProvRecord, jobId, stepName, targetEntityType);
    assertLib.verifyEndTimeInProvenanceRecord(finalProvRecord);
    test.assertFalse(hubTest.stagingDocumentExists(fn.documentUri(finalProvRecord)));
  });
}

export default {
  onFinishJob,
  onStartStep
};

