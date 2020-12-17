'use strict';

const stepService = require("../lib/stepService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

try {
  stepService.saveStep("mapping", {
    name: "invalidStep",
    selectedSource: "test",
    sourceQuery: "cts.collectionQuery('customer-input')"
  });
  throw Error("Expected validation error due to targetEntityType missing");  
} catch (e) {
  assertions.push(
    test.assertEqual("400", e.data[0]),
    test.assertEqual("Mapping 'invalidStep' is missing the following required properties: [\"targetEntityType\"]", 
      e.data[1], "The step name should be included so it's easier to debug")
  );
}

assertions;