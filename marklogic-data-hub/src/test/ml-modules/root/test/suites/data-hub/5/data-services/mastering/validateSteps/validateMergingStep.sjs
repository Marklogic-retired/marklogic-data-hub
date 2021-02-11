const test = require("/test/test-helper.xqy");

function invokeService(stepName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mastering/validateMergingStep.sjs",
    {"stepName": stepName}
  ));
}

[
  test.assertEqual([], invokeService("no-step-warnings"), "No errors, returns empty array"),
  test.assertEqual([{"level":"warn","message":"Warning: Target Collections includes the target entity type validateMergeEntity"}],
    invokeService("targetEntityType-in-additionalCollections"), "targetEntityType-in-additionalCollections warning does not match"),
  test.assertEqual([{"level":"warn","message":"Warning: The current merge settings might produce merged documents that are inconsistent with the entity type\nIn the entity type validateMergeEntity, the property or properties property1 allows only a single value.\nIn every merge rule for the property property1, set Max Values or Max Sources to 1."}],
    invokeService("propertiesCount-mismatch"), `propertiesCount-mismatch warning does not match.`),
  test.assertEqual([{"level":"warn","message":"Warning: Target Collections includes temporal collection(s): myTemporalCollection"}],
    invokeService("temporal-collection-in-additionalCollections"), "temporal-collection-in-additionalCollections warning does not match")
];


