const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const ingestionService = require("../lib/ingestionService.sjs");

ingestionService.ingest({uriprefix: "/bulkTest/"}, {}, [
  {"testDoc": "one"},
  {"testDoc": "two"}
]);

const uris = xdmp.eval('cts.uriMatch("/bulkTest/**")').toArray();

const assertions = [
  test.assertEqual(2, uris.length)
];

uris.forEach(uri => {
  const record = hubTest.getRecord(uri);
  assertions.push(
    test.assertEqual(0, record.collections.length,
      "Since no collections were specified, the URI should not in any collections by default")
  );
});

assertions;
