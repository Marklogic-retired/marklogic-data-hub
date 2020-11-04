'use strict';

const flowService = require("../lib/flowService.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const stepName = "myIngester";
const stepDefinitionType = "ingestion";
const flowName = "myFlow";

// Create a step
let info = {
  name: stepName,
  description: "optional",
  sourceFormat: "xml",
  targetFormat: "xml",
  customHook: {
    module: "/some/module.sjs",
    parameters: {
      hello: "world"
    },
    user: "admin",
    runBefore: false
  },
  processors: [
    {
      path: "/some/processor.sjs",
      vars: {
        some: "value"
      },
      when: "beforeContentPersisted"
    }
  ],
  collections: ["default-ingestion"],
  additionalCollections: ["customerJSON"],
  inputFilePath: "data-sets/CustomerLoadJSON",
  outputURIReplacement: ".*CustomerLoadJSON,'/customer'",
  outputURIPrefix: "",
  separator: ",",
  batchSize: 52,
  threadCount: 7
};
stepService.saveStep(stepDefinitionType, info);


// Create a flow and add the step to it
flowService.createFlow(flowName, null);
flowService.addStepToFlow(flowName, stepDefinitionType, stepName);

const fullFlow = flowService.getFullFlow(flowName);
const flowStep = fullFlow.steps["1"];
const options = flowStep.options;

assertions.push(
  test.assertEqual(stepName, flowStep.name),
  test.assertEqual("default-ingestion", flowStep.stepDefinitionName),
  test.assertEqual(stepDefinitionType, flowStep.stepDefinitionType),
  test.assertEqual("/some/module.sjs", flowStep.customHook.module),
  test.assertEqual("world", flowStep.customHook.parameters.hello),
  test.assertEqual("admin", flowStep.customHook.user),
  test.assertEqual(false, flowStep.customHook.runBefore),
  test.assertEqual("/some/processor.sjs", flowStep.processors[0].path),
  test.assertEqual("beforeContentPersisted", flowStep.processors[0].when),
  test.assertEqual("value", flowStep.processors[0].vars.some),
  test.assertEqual(52, flowStep.batchSize),
  test.assertEqual(7, flowStep.threadCount),

  // TODO sourceFormat should be renamed to inputFileType
  test.assertEqual("xml", flowStep.fileLocations.inputFileType),
  test.assertEqual("data-sets/CustomerLoadJSON", flowStep.fileLocations.inputFilePath),
  //'outputURIReplacement' should be removed from the step as it has 'outputURIPrefix' set
  test.assertNotExists(flowStep.fileLocations.outputURIReplacement),
  test.assertEqual("", flowStep.fileLocations.outputURIPrefix),
  test.assertEqual(",", flowStep.fileLocations.separator),

  test.assertEqual(null, options.headers.sources),
  test.assertEqual("currentDateTime", options.headers.createdOn),
  test.assertEqual("currentUser", options.headers.createdBy),

  test.assertEqual("data-hub-STAGING", options.targetDatabase),
  test.assertEqual("coarse", options.provenanceGranularityLevel),
  test.assertEqual("data-hub-common,read,data-hub-common,update", options.permissions),

  // TODO targetFormat should be renamed to outputFormat
  test.assertEqual("xml", options.outputFormat),
  test.assertFalse(flowStep.hasOwnProperty("targetFormat"), "targetFormat should have been converted to options.outputFormat"),

  test.assertEqual(2, options.collections.length,
    "The collection and additionalCollections should have been combined"),
  test.assertEqual("default-ingestion", options.collections[0]),
  test.assertEqual("customerJSON", options.collections[1]),
  test.assertFalse(flowStep.hasOwnProperty("collections")),
  test.assertFalse(flowStep.hasOwnProperty("additionalCollections"))
);

// Verify that the fileLocations properties aren't in the step or in the options
["sourceFormat", "inputFilePath", "outputURIReplaceent", "separator"].forEach(prop => {
  assertions.push(
    test.assertFalse(flowStep.hasOwnProperty(prop), "Expected step not to have property: " + prop),
    test.assertFalse(options.hasOwnProperty(prop), "Expected options not to have property: " + prop)
  )
});

assertions;

