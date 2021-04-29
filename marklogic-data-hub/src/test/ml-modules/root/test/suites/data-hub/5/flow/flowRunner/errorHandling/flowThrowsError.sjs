const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

// decimalProp is expected have a decimal range index on it that the bootstrap process deploys
const response = flowRunner.runFlowOnContent(flowName,
  [
    { "uri": "/customer1.json", "value": { "decimalProp": 1 } },
    { "uri": "/customer2.json", "value": { "decimalProp": "invalid value" } }
  ],
  "jobId"
);

const assertions = [
  test.assertEqual("finished_with_errors", response.jobStatus, 
    "While the steps completed successfully, the writing of step output should have failed due to an invalid range index value error. " + 
    "This results in a status of finished with errors"),
  
  test.assertEqual(1, response.flowErrors.length, 
    "flowErrors was added in 5.5 to capture flow-level errors when running connected steps"),
  test.assertEqual("XDMP-RANGEINDEX", response.flowErrors[0].name),
  test.assertEqual("Range index error", response.flowErrors[0].message),
  test.assertTrue(response.flowErrors[0].description.includes('XDMP-LEXVAL: Invalid lexical value \"invalid value\"'), 
    "The toString result for an ML error typically provides the most helpful information; users don't need to see a very complicated " + 
    "stack that references code that they don't have the ability to modify"),
  
  test.assertEqual(0, hubTest.getUrisInCollection("customStepOne").length, 
    "Since both docs are written to final and one failed, nothing should have been written to final"),
  test.assertEqual(0, hubTest.getUrisInCollection("customStepTwo").length),
];

const job = hubTest.getJobRecord("jobId").document.job;
assertions.push(
  test.assertEqual("finished_with_errors", job.jobStatus),
  test.assertEqual("2", job.lastAttemptedStep),
  test.assertEqual("2", job.lastCompletedStep),
  test.assertEqual("completed step 1", job.stepResponses["1"].status),
  test.assertEqual("completed step 2", job.stepResponses["2"].status),

  test.assertEqual(1, job.flowErrors.length),
  test.assertEqual("XDMP-RANGEINDEX", job.flowErrors[0].name),
  test.assertEqual("Range index error", job.flowErrors[0].message),
  test.assertTrue(job.flowErrors[0].description.includes('XDMP-LEXVAL: Invalid lexical value \"invalid value\"'))
);

assertions;