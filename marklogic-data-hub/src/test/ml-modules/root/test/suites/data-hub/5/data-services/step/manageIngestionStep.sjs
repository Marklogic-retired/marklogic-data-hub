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
  targetFormat: "json"
};

// Will use this for assertions on service responses
let expectedStep = Object.assign({}, info);

// Create a step and verify the response
let serviceResponse = stepService.saveStep(stepDefinitionType, info);
expectedStep.targetDatabase = "data-hub-STAGING";
expectedStep.collections = [stepName];
expectedStep.provenanceGranularityLevel = "coarse";
expectedStep.permissions = "data-hub-operator,read,data-hub-operator,update";

hubJsTest.verifyJson(expectedStep, serviceResponse, assertions);
hubJsTest.verifyJson(expectedStep, stepService.getStep(stepDefinitionType, stepName), assertions);

// TODO Will put this under /steps soon
const expectedUri = "/ingestion/myIngester.ingestion.json";
assertions = assertions
  .concat(hubTest.assertInCollections(expectedUri, ["http://marklogic.com/data-hub/steps", "http://marklogic.com/data-hub/steps/ingestion"]))
  .concat(hubTest.assertHasPermissions(expectedUri, "data-hub-load-data-reader,read,data-hub-load-data-writer,update"));

assertions;
