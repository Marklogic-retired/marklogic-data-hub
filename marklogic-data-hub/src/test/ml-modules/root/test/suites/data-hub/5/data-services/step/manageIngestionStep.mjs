'use strict';

const hubTest = require("/test/data-hub-test-helper.xqy");
import hubJsTest from "/test/data-hub-test-helper.mjs";
import stepService from "../lib/stepService.mjs";
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
expectedStep.batchSize = 100;
expectedStep.stepDefinitionName = "default-ingestion";
expectedStep.headers = {
  "sources": [{"name": stepName}],
  "createdOn": "currentDateTime",
  "createdBy": "currentUser"
};

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
info.stepDefinitionName = 'custom-ingestion';
serviceResponse = stepService.updateStep(stepDefinitionType, info);

delete expectedStep.outputURIReplacement;
expectedStep.outputURIPrefix = '/prefix/';
expectedStep.stepDefinitionName = 'custom-ingestion';

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);
assertions;
