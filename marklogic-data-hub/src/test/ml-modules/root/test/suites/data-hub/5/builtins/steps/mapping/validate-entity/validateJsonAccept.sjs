const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

if (lib.canTestJsonSchemaValidation() && esMappingLib.versionIsCompatibleWithES()) {
  const envelope = lib.mapInstance("/content/invalid-customer.json", "accept", "json").value.root.envelope;
  let errors = envelope.headers.datahub.validationErrors;
  
  [
    test.assertEqual("XDMP-VALIDATEERRORS", fn.string(errors.name)),
    test.assertTrue(fn.string(errors.data[0]).indexOf("Required FirstName property not found") > -1),
    test.assertTrue(fn.string(errors.data[1]).indexOf("Required LastName property not found") > -1),

    /*
    The other two error messages returned by xdmp.jsonValidate are of the form
    "XDMP-JSVALIDATEINVNODE: Invalid node: Node Customer". They don't really add any value over the
    XDMP-JSVALIDATEMISSING messages, but we can't reliably discard them either yet.
     */
    test.assertEqual(4, errors.formattedMessages.length,
      "For 5.1.0, assuming that all error messages should be tossed into the formattedMessages array, even when they " +
      "can't be formatted. That allows for a UI to choose which ones to display - i.e. the ones with a propertyName " +
      "property are known to have messages that recognized and thus formatted and associated with a property."),

    test.assertEqual("FirstName", fn.string(errors.formattedMessages[0].propertyName)),
    test.assertEqual("Required FirstName property not found", fn.string(errors.formattedMessages[0].message)),
    test.assertEqual("LastName", fn.string(errors.formattedMessages[1].propertyName)),
    test.assertEqual("Required LastName property not found", fn.string(errors.formattedMessages[1].message))
  ];
}
