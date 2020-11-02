const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const ingestionService = require("../lib/ingestionService.sjs");

const workUnit = {
  collections: "bulkOne,bulkTwo"
};

ingestionService.ingest(workUnit, {}, [{"testDoc": "one"}]);

const doc = hubTest.getRecordInCollection("bulkOne");
const envelope = doc.document.envelope;

[
  test.assertFalse(doc.uri.startsWith("/"), "If no uriprefix is specified, a '/' should be added by default, as the user may not want that"),
  test.assertFalse(doc.uri.startsWith("null"), "If no uriprefix is specified, the URI should not start with 'null'"),

  test.assertEqual(2, doc.collections.length),
  test.assertEqual("bulkOne", doc.collections[0]),
  test.assertEqual("bulkTwo", doc.collections[1])
];
