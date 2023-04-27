const test = require("/test/test-helper.xqy");

function invokeService(stepName, view, entityPropertyPath) {
  const results = xdmp.invoke(
    "/data-hub/data-services/mastering/validateMergingStep.mjs",
    { stepName, view, entityPropertyPath }
  );
  return xdmp.toJSON(results);
}

[
  test.assertEqual(xdmp.toJSON([]), invokeService("no-step-warnings", "settings"), "No errors, returns empty array"),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes the target entity type validateMergeEntity"}]),
    invokeService("targetEntityType-in-additionalCollections", "settings"), "targetEntityType-in-additionalCollections warning does not match"),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes the source collection dataHubMatchSummary-validateMergeEntity"}]),
      invokeService("sourceCollection-in-additionalCollections", "settings"), "sourceCollection-in-additionalCollections warning does not match"),
  // test "rules" view for properties
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: The current merge settings might produce merged documents that are inconsistent with the entity type\nIn the entity type validateMergeEntity, the property or properties property1, property2 allows only a single value.\nIn every merge rule for the property property1, property2 set Max Values or Max Sources to 1."}]),
    invokeService("propertiesCount-mismatch", "rules"), `propertiesCount-mismatch warning does not match.`),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: The current merge settings might produce merged documents that are inconsistent with the entity type\nIn the entity type validateMergeEntity, the property or properties property1 allows only a single value.\nIn every merge rule for the property property1 set Max Values or Max Sources to 1."}]),
    invokeService("propertiesCount-mismatch", "rules", "property1"), `propertiesCount-mismatch warning does not match when filtering by entity property path.`),
  test.assertEqual(xdmp.toJSON([]), invokeService("propertiesCount-mismatch", "rules", "property3"), `propertiesCount-mismatch warning shouldn't show for property3 limited by strategy.`),
  test.assertEqual(xdmp.toJSON([]), invokeService("propertiesCount-mismatch", "settings"), `propertiesCount-mismatch warning shouldn't show for 'settings' view.`),
  test.assertEqual(xdmp.toJSON([{"level":"warn","message":"Warning: Target Collections includes temporal collection(s): myTemporalCollection"}]),
    invokeService("temporal-collection-in-additionalCollections", "settings"), "temporal-collection-in-additionalCollections warning does not match"),
  test.assertEqual(xdmp.toJSON([]), invokeService("temporal-collection-in-additionalCollections", "rules"), "temporal-collection-in-additionalCollections warning shouldn't show for 'rules' view.")
];


