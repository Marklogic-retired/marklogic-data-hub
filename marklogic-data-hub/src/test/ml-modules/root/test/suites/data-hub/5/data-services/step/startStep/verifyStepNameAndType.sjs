'use strict';

const test = require("/test/test-helper.xqy");
const jobService = require("../../lib/jobService.sjs");

const jobId = "verifyProvenanceRecordOnStartJob-jobId";
const flowName = "simpleMappingFlow";
const stepNumber = "1";

let assertions = []
jobService.startJob(jobId, flowName);
let stepResponses = jobService.startStep(jobId, stepNumber, flowName, {});
let stepResponse = stepResponses["job"]["stepResponses"][stepNumber];

assertions.push(
  test.assertNotEqual(null, stepResponse),
  test.assertEqual("mappingStep1", stepResponse["stepName"]),
  test.assertEqual("MAPPING", stepResponse["stepDefinitionType"]),
);

assertions;
