declareUpdate();

const hubTestX = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

hubTestX.resetHub();
hubTestX.loadArtifacts(test.__CALLER_FILE__);
