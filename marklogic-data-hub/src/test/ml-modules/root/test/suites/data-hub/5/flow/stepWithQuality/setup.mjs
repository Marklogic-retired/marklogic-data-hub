xdmp.invokeFunction(() => {
  const hubTestX = require("/test/data-hub-test-helper.xqy");
  hubTestX.resetHub();
}, { update: "true" });