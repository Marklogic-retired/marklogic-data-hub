const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const ingestionService = require("../lib/ingestionService.sjs");

ingestionService.ingest(
  {
    "sourcename": "bulkSourceName",
    "collections": "bulkSourceTest"
  },
  {}, [{"testDoc": "one"}]
);

const record = hubTest.getRecordInCollection("bulkSourceTest");
const envelope = record.document.envelope;

[
  test.assertEqual(1, envelope.headers.sources.length),
  test.assertEqual("bulkSourceName", envelope.headers.sources[0].name),
  test.assertFalse(envelope.headers.sources[0].hasOwnProperty("datahubSourceType"),
    "datahubSourceType should not be set since sourcetype was not set")
];
