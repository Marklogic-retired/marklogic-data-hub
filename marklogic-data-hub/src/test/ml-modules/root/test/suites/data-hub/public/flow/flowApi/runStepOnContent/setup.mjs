import hubTest from "/test/data-hub-test-helper.mjs";

xdmp.invokeFunction(() => {
  const hubTestX = require("/test/data-hub-test-helper.xqy");

  hubTestX.resetHub();
}, { update: "true" });

xdmp.invokeFunction(() => {
  const defaultStep = {};

  const stepThatThrowsError = {
    "properties": {
      "customerId": {"sourcedFrom": "unknownFunction()"}
    }
  };

  hubTest.createSimpleMappingProject([defaultStep, stepThatThrowsError]);
}, { update: "true" });