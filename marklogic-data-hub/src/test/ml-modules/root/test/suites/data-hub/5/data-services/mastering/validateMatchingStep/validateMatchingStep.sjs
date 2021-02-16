const test = require("/test/test-helper.xqy");

function invokeService(stepName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mastering/validateMatchingStep.sjs",
    {"stepName": stepName}
  ));
}

[
  test.assertEqual([], invokeService("no-step-warnings"), "No errors, returns empty array"),
  test.assertEqual([{"level":"warn","message":"Warning: Target Collections includes the target entity type Person"}],
    invokeService("targetEntityType-in-additionalCollections"), "targetEntityType-in-additionalCollections warning does not match"),
  test.assertEqual([{"level":"warn","message":"Warning: Target Collections includes temporal collection(s): myTemporalCollection"}],
    invokeService("temporal-collection-in-additionalCollections"), "temporal-collection-in-additionalCollections warning does not match")
];


