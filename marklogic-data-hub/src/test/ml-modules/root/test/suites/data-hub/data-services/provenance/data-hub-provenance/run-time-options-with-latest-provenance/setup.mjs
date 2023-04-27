import hubTest from "/test/data-hub-test-helper.mjs";

xdmp.invokeFunction(() => {
  const hubTestX = require("/test/data-hub-test-helper.xqy");

  hubTestX.resetHub();
  hubTest.createSimpleMappingProject([{}]);
}, { update: "true" });