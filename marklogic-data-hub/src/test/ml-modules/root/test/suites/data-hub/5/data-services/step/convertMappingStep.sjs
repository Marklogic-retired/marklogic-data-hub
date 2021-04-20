'use strict';

const flowService = require("../lib/flowService.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const stepName = "myMapper";
const stepDefinitionType = "mapping";
const flowName = "myFlow";

// Create a step with mapping properties and a version
let info = {
  name: stepName,
  description: "optional",
  selectedSource: "collection",
  sourceQuery: "cts.collectionQuery('customer-input')",
  targetEntityType: "http://example.org/Customer-0.0.1/Customer",
  version: "1",
  properties : {
    "customerID" : {
      "sourcedFrom" : "CustomerID"
    }
  },
  someWackyUserProperty: "could be anything"
};
stepService.saveStep(stepDefinitionType, info);


// Create a flow and add the step to it
flowService.createFlow(flowName, null);
flowService.addStepToFlow(flowName, stepDefinitionType, stepName);


// Get the full flow and verify the step is mapped correctly
// That boils down to ensuring that certain known properties are mapped to "top"-level properties in the step, while
// everything else is written to options
const fullFlow = flowService.getFullFlow(flowName);
const flowStep = fullFlow.steps["1"];
const options = flowStep.options;
assertions.push(
  test.assertEqual(flowName, fullFlow.name),
  test.assertEqual(stepName, flowStep.name),
  test.assertEqual("entity-services-mapping", flowStep.stepDefinitionName),
  test.assertEqual(stepDefinitionType, flowStep.stepDefinitionType),
  test.assertEqual(100, flowStep.batchSize),
  test.assertEqual("cts.collectionQuery('customer-input')", options.sourceQuery),
  test.assertEqual("http://example.org/Customer-0.0.1/Customer", options.targetEntityType),
  test.assertEqual("data-hub-STAGING", options.sourceDatabase),
  test.assertEqual("data-hub-FINAL", options.targetDatabase),
  test.assertEqual(stepName, options.collections[0]),
  test.assertEqual("Customer", options.collections[1]),
  test.assertEqual("doNotValidate", options.validateEntity),
  test.assertEqual("off", options.provenanceGranularityLevel),
  test.assertEqual("data-hub-common,read,data-hub-common,update", options.permissions),
  test.assertEqual("could be anything", options.someWackyUserProperty,
    "Any unrecognized property should be copied to the options object"),

  test.assertEqual(stepName, options.mapping.name,
    "FlowRunner expects to retrieve mapping properties based on options.mapping.name"),
  test.assertFalse(flowStep.hasOwnProperty("properties"),
    "properties should have been replaced with options.mapping"),
  test.assertEqual("1", options.mapping.version,
    "Version should be added to the mapping if it exists on the step"),
  test.assertFalse(flowStep.hasOwnProperty("version"),
    "Version should have been replaced with options.mapping.version")
);

assertions
