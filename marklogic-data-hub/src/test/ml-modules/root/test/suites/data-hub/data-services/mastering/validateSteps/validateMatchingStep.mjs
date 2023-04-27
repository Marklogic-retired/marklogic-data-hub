const test = require("/test/test-helper.xqy");

function invokeService(stepName) {
  return xdmp.toJSON(xdmp.invoke(
    "/data-hub/data-services/mastering/validateMatchingStep.mjs",
    {"stepName": stepName}
  ));
}

[
  test.assertEqual(xdmp.toJSON([]), invokeService("no-step-warnings"), "No errors, returns empty array"),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes the target entity type Person"}]),
    invokeService("targetEntityType-in-additionalCollections"), "targetEntityType-in-additionalCollections warning does not match"),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes the source collection map-persons"}]),
      invokeService("sourceCollection-in-additionalCollections"), "sourceCollection-in-additionalCollections warning does not match"),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes temporal collection(s): myTemporalCollection"}]),
    invokeService("temporal-collection-in-additionalCollections"), "temporal-collection-in-additionalCollections warning does not match")
];


