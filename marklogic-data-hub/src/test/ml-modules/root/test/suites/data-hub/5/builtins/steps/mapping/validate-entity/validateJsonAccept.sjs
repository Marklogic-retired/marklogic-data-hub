const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

if (xdmp.version().startsWith("10.0-2019")) {
  console.log("Not running test due to bug https://bugtrack.marklogic.com/53122");
}

else if (esMappingLib.versionIsCompatibleWithES()) {
  const envelope = lib.mapInstance("/content/invalid-customer.json", "accept", "json").value.root.envelope;

  console.log("envelope", envelope);
  [
    test.assertEqual("XDMP-VALIDATEERRORS", fn.string(envelope.headers.validationErrors.name)),
    test.assertTrue(fn.string(envelope.headers.validationErrors.data[0]).indexOf("Required FirstName property not found") > -1),
    test.assertTrue(fn.string(envelope.headers.validationErrors.data[1]).indexOf("Required LastName property not found") > -1)
  ];
}
