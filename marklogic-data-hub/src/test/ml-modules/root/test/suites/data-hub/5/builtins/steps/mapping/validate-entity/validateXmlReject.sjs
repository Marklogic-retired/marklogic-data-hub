const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

let error = null;

try {
  lib.mapInstance("/content/invalid-xml-customer.xml", "reject", "xml");
} catch (e) {
  error = e;
}

[
  test.assertTrue(error != null, "Expected an error to be thrown")
];
