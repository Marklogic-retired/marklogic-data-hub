const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const response = flowRunner.processContentWithFlow("simpleMappingFlow",
  [{
    "uri": "/doesntMatter.json",
    "value": {"customerId": 1}
  }],
  sem.uuidString(), {}, ["2"]
);

const message = "Unexpected response: " + xdmp.toJsonString(response);

const assertions = [
  test.assertEqual("failed", response.jobStatus, message),
  test.assertEqual(1, response.stepResponses["2"].stepOutput.length, "Expected a single error; " + message),
  test.assertEqual("Unable to invoke beforeMain on step 2 in flow 'simpleMappingFlow'; " +
    "cause: Throwing error on purpose", response.stepResponses["2"].stepOutput[0],
    "The error should explain that beforeMain failed, along with the error thrown from beforeMain; " + message)
];

// Test that validation fails when the values function throws an error
const mappingStep = hubTest.getRecord("/steps/mapping/mappingStep2.step.json").document;
try {
  esMappingLib.validateAndTestMapping(mappingStep, "/content/customer1.json");
  throw Error("Expected an error because the getParameterValues function throws an error on purpose");
} catch (error) {
  assertions.push(
    test.assertEqual("Unable to apply mapping parameters module at path '/test/suites/data-hub/5/mapping/user-parameters/test-data/bad-get-parameter-values.sjs'; " +
    "cause: Throwing error on purpose", error.data[1])
  );
}

assertions
