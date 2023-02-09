const test = require("/test/test-helper.xqy");
import hubTest from "/test/data-hub-test-helper.mjs";
import ingestionService from "../lib/ingestionService.mjs";

ingestionService.ingest(
  {
    "sourcetype": "bulkSourceType",
    "collections": "bulkSourceTest"
  },
  {}, [{"testDoc": "one"}]
);

const record = hubTest.getRecordInCollection("bulkSourceTest");
const envelope = record.document.envelope;

[
  test.assertEqual(1, envelope.headers.sources.length),
  test.assertEqual("bulkSourceType", envelope.headers.sources[0].datahubSourceType),
  test.assertFalse(envelope.headers.sources[0].hasOwnProperty("name"),
    "name should not be set if sourcename was not set")
];
