const entitySearchService = require("/test/suites/data-hub/5/data-services/lib/entitySearchService.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

let doc1 = entitySearchService.getRecord("/exp/doc1");

assertions.push(
  test.assertExists(doc1.data),
  test.assertExists(doc1.docUri),
  test.assertExists(doc1.recordType),
  test.assertEqual("json", doc1.recordType),
  test.assertExists(doc1.recordMetadata),
  test.assertEqual("my-step-1", doc1.recordMetadata.datahubCreatedByStep),
  test.assertEqual("my-flow-1", doc1.recordMetadata.datahubCreatedInFlow),
  test.assertExists(doc1.collections),
  test.assertEqual(["doc1"], doc1.collections),
  test.assertExists(doc1.permissions),
  test.assertExists("data-hub-common", doc1.permissions[0].roleName),
  test.assertExists("update", doc1.permissions[0].capability),
  test.assertExists("data-hub-common", doc1.permissions[1].roleName),
  test.assertExists("read", doc1.permissions[0].capability),
  test.assertExists(doc1.sources),
  test.assertExists(doc1.history),
  test.assertExists(doc1.documentSize),
  test.assertEqual(912, doc1.documentSize.value),
  test.assertEqual("B", doc1.documentSize.units),
  test.assertExists(doc1.quality),
  test.assertEqual(0, doc1.quality),
  test.assertExists(doc1.documentProperties)
);

assertions;
