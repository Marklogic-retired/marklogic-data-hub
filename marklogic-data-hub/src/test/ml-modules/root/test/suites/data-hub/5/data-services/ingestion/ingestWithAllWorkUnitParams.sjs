'use strict';

const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const ingestionService = require("../lib/ingestionService.sjs");

// Intended to test every possible param in a workUnit in a single test
// Please add to this as new params are defined

const workUnit = {
  collections: "bulkOne,bulkTwo",
  permissions: "rest-reader,read,rest-extension-user,update",
  uriprefix: "/bulkTest/",
  sourcename: "bulkSourceName",
  sourcetype: "bulkSourceType"
};

ingestionService.ingest(workUnit, {}, [{"testDoc": "one"}]);

const record = hubTest.getRecordInCollection("bulkOne");
const envelope = record.document.envelope;

[
  test.assertTrue(record.uri.endsWith(".json"), "The endpoint only supports JSON, so .json should be the suffix of the URI"),

  test.assertEqual(xdmp.getCurrentUser(), envelope.headers.createdBy),
  test.assertTrue(envelope.headers.createdOn != null),
  test.assertEqual(1, envelope.headers.sources.length),
  test.assertEqual("bulkSourceName", envelope.headers.sources[0].name),
  test.assertEqual("bulkSourceType", envelope.headers.sources[0].datahubSourceType),
  test.assertEqual("one", envelope.instance.testDoc, "The ingested data should have been wrapped in envelope/instance"),

  test.assertEqual(2, record.collections.length),
  test.assertEqual("bulkOne", record.collections[0]),
  test.assertEqual("bulkTwo", record.collections[1]),

  test.assertEqual(2, Object.keys(record.permissions).length),
  test.assertEqual("read", record.permissions["rest-reader"][0]),
  test.assertEqual("update", record.permissions["rest-extension-user"][0])
];
