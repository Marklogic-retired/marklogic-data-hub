'use strict';

/**
 * While this is specific to a mapping step, it's intended to exercise all the step endpoints in a fairly generic way
 * such that we don't need all of this for every other step type. Instead, a test for another step type can just focus
 * on what's specific to that test - e.g. collections, permissions.
 */

const flowService = require("../lib/flowService.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];
const stepName = "myMapper";
const stepDefinitionType = "mapping";

let info = {
  name: stepName,
  description: "optional",
  selectedSource: "collection",
  sourceQuery: "cts.collectionQuery('customer-input')",
  targetEntityType: "http://example.org/Customer-0.0.1/Customer",
  headers:"",
  customHook:"",
  processors: ""
};

// Create a step and verify the response
let serviceResponse = stepService.saveStep(stepDefinitionType, info);

//Remove 'headers', 'customHook' and 'processors' from 'info' before assigning to 'expectedStep' as they are json objects
delete info.headers;
delete info.customHook;
delete info.processors;

// Will use this for assertions on service responses
let expectedStep = Object.assign({}, info);
expectedStep.sourceDatabase = "data-hub-STAGING";
expectedStep.targetDatabase = "data-hub-FINAL";
expectedStep.collections = [stepName, "Customer"];
expectedStep.validateEntity = "doNotValidate";
expectedStep.provenanceGranularityLevel = "coarse";
expectedStep.permissions = "data-hub-common,read,data-hub-common,update";
expectedStep.targetFormat = "json";

assertions.push(
  test.assertEqual("{}", JSON.stringify(serviceResponse.headers)),
  test.assertEqual("{}", JSON.stringify(serviceResponse.customHook)),
  test.assertEqual("[]", JSON.stringify(serviceResponse.processors))
);

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);

const expectedUri = "/steps/mapping/myMapper.step.json";
assertions = assertions
  .concat(hubTest.assertInCollections(expectedUri, ["http://marklogic.com/data-hub/mappings", "http://marklogic.com/data-hub/steps", "http://marklogic.com/data-hub/steps/mapping"]))
  .concat(hubTest.assertHasPermissions(expectedUri, "data-hub-mapping-reader,read,data-hub-mapping-writer,update"));


// Update the step and verify
let propertiesToAssign = {
  name: stepName,
  description: "modified description",
  additionalCollections: ["anotherOne", "anotherTwo"],
  version: "1",
  properties : {
    "customerID" : {
      "sourcedFrom" : "CustomerID"
    }
  }
};

// Update our expected step for making assertions; not including "properties" because verifyJson doesn't yet handle
// nested properties
expectedStep.description = propertiesToAssign.description;
expectedStep.additionalCollections = propertiesToAssign.additionalCollections;
expectedStep.version = propertiesToAssign.version;

serviceResponse = stepService.saveStep(stepDefinitionType, propertiesToAssign);

assertions.push(
  test.assertEqual("CustomerID", serviceResponse.properties.customerID.sourcedFrom)
);

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);

assertions.push(
  test.assertEqual("{}", JSON.stringify(serviceResponse.headers)),
  test.assertEqual("{}", JSON.stringify(serviceResponse.customHook)),
  test.assertEqual("[]", JSON.stringify(serviceResponse.processors))
);

// Create a flow and add the step to it
const flowName = "myFlow";
flowService.createFlow(flowName, null);
flowService.addStepToFlow(flowName, stepDefinitionType, stepName);

// Verify the step reference exists
const flow = flowService.getFlow(flowName);
const expectedStepId = stepName + "-" + stepDefinitionType;
assertions.push(
  test.assertEqual(flowName, flow.name),
  test.assertEqual(expectedStepId, flow.steps["1"].stepId)
);

// Delete the step
stepService.deleteStep(stepDefinitionType, stepName);

// Verify step is removed from flow
const updatedFlow = flowService.getFlow(flowName);
assertions.push(
  test.assertEqual(flowName, updatedFlow.name),
  test.assertEqual(0, Object.keys(updatedFlow.steps).length, "The flow should have no steps now")
);

// Verify step doesn't exist
try {
  stepService.getStep(stepDefinitionType, stepName);
  throw new Error("Expected an error because the step was deleted");
} catch (e) {
  assertions.push(
    test.assertEqual("404", e.data[0]),
    test.assertEqual("NOT FOUND", e.data[1])
  );
}

assertions;
