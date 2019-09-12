const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

const envelope = lib.mapInstance("/content/invalid-customer.json", "accept", "json").value.root.envelope;

[
  test.assertEqual("XDMP-VALIDATEERRORS", fn.string(envelope.headers.validationErrors.name)),
  test.assertTrue(fn.string(envelope.headers.validationErrors.data[0]).indexOf("Required FirstName property not found") > -1),
  test.assertTrue(fn.string(envelope.headers.validationErrors.data[1]).indexOf("Required LastName property not found") > -1)
];
