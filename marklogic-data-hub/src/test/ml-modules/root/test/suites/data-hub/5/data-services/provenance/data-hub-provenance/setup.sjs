declareUpdate();

const hubTest = require("/test/data-hub-test-helper.sjs");
const hubTestX = require("/test/data-hub-test-helper.xqy");

hubTestX.resetHub();
hubTest.createSimpleMappingProject([{}]);
