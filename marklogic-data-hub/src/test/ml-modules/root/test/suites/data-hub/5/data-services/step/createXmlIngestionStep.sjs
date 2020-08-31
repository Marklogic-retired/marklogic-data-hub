'use strict';

const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const userInput = {name: "xmlIngester", sourceFormat: "xml", targetFormat: "xml"};
const savedStep = stepService.saveStep("ingestion", userInput);

[
  test.assertEqual("xmlIngester-ingestion", savedStep.stepId),
  test.assertEqual("xml", savedStep.sourceFormat),
  test.assertEqual("xml", savedStep.targetFormat),
  test.assertFalse(savedStep.hasOwnProperty("outputFormat"),
    "outputFormat is added by the default-ingestion step definition, but because HC is instead using the property " +
    "targetFormat (which will be converted to outputFormat when it's time to run a step), outputFormat should not be " +
    "included when saving a step")
];
