'use strict';

const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const ingestionService = require("../lib/ingestionService.sjs");

// Including collections so there's an easy way to find the doc
const workUnit = {
  collections: "bulkTest",
  permissions: null,
  uriprefix: null,
  sourcename: null,
  sourcetype: null
};

ingestionService.ingest(workUnit, {}, [{"testDoc": "one"}]);

const record = hubTest.getRecordInCollection("bulkTest");
const envelope = record.document.envelope;

[
  test.assertFalse(record.uri.startsWith("null"),
    "When uriprefix is null, the string 'null' should not be added to the URI as a prefix"),

  test.assertEqual(null, envelope.headers.sources,
    "No sources should have been created since sourcename and sourcetype are both null"),
  test.assertEqual("one", envelope.instance.testDoc, "The ingested data should have been wrapped in envelope/instance"),

  // Should use default permissions
  test.assertEqual(1, Object.keys(record.permissions).length),
  test.assertEqual("read", record.permissions["data-hub-operator"][0]),
  test.assertEqual("update", record.permissions["data-hub-operator"][1]),

  //should add default metadata
  test.assertExists(record.metadata.datahubCreatedOn),
  test.assertExists(record.metadata.datahubCreatedBy),
  test.assertNotEqual('', record.metadata.datahubCreatedBy),
  test.assertExists(record.metadata.datahubCreatedByJob)
];
