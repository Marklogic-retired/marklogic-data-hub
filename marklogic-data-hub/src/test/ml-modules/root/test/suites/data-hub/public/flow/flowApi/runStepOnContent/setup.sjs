declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");

hubTestX.resetHub();

const defaultStep = {};

const stepThatThrowsError = {
  "properties": {
    "customerId": {"sourcedFrom": "unknownFunction()"}
  }
};

hubTest.createSimpleMappingProject([defaultStep, stepThatThrowsError]);
