declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");

hubTestX.resetHub();

const firstMappingStep = {
  "properties": {
    "name": {
      "sourcedFrom": "name"
    },
    "integers": {
      "sourcedFrom": "addOne((1,2,3))"
    }
  }
};


hubTest.createSimpleMappingProject([firstMappingStep]);
