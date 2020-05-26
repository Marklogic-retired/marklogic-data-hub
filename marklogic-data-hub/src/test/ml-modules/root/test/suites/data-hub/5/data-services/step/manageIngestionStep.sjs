'use strict';

const hubTest = require("/test/data-hub-test-helper.xqy");
const hubJsTest = require("/test/data-hub-test-helper.sjs");
const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];
const stepName = "myIngester";
const stepDefinitionType = "ingestion";

let info = {
  name: stepName,
  description: "optional",
  sourceFormat: "json",
  targetFormat: "json",
  outputURIReplacement: "abc,'def'"
};

// Will use this for assertions on service responses
let expectedStep = Object.assign({}, info);

// Create a step and verify the response
let serviceResponse = stepService.saveStep(stepDefinitionType, info);
expectedStep.targetDatabase = "data-hub-STAGING";
expectedStep.collections = [stepName];
expectedStep.provenanceGranularityLevel = "coarse";
expectedStep.permissions = "data-hub-common,read,data-hub-common,update";
expectedStep.outputURIReplacement= "abc,'def'";

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);

const expectedUri = "/steps/ingestion/myIngester.step.json";
assertions = assertions
  .concat(hubTest.assertInCollections(expectedUri, ["http://marklogic.com/data-hub/steps", "http://marklogic.com/data-hub/steps/ingestion"]))
  .concat(hubTest.assertHasPermissions(expectedUri, "data-hub-ingestion-reader,read,data-hub-ingestion-writer,update"));

// Update a step and verify the response
//Remove 'outputURIReplacement' from payload
info.outputURIPrefix = '/prefix/';
delete info.outputURIReplacement;
serviceResponse = stepService.saveStep(stepDefinitionType, info);

delete expectedStep.outputURIReplacement;
expectedStep.outputURIPrefix = '/prefix/';

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);
assertions;
