import lib from "/test/suites/data-hub/5/builtins/steps/mapping/validate-entity/lib/lib.mjs";
const test = require("/test/test-helper.xqy");

let error = null;
try {
  lib.mapInstance("/content/invalid-customer.json", "reject", "json");
} catch (e) {
  error = e;
}

[
  test.assertTrue(error != null, "Expected an error to be thrown")
];
