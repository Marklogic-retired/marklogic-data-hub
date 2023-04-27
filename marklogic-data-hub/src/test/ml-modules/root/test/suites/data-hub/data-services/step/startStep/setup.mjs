import hubTest from "/test/data-hub-test-helper.mjs";
const hubTestX = require("/test/data-hub-test-helper.xqy");

xdmp.invokeFunction(() => {
  hubTestX.resetHub();
  hubTest.createSimpleMappingProject([{}]);
}, { update: "true" });