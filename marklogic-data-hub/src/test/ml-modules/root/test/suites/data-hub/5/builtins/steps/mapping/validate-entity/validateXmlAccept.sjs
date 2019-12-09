const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

if (esMappingLib.versionIsCompatibleWithES()) {
  const envelope = lib.mapInstance("/content/invalid-xml-customer.xml", "accept", "xml").value;

  let assertions = [
    test.assertEqual(1, envelope.xpath("count(/*:envelope/*:headers/datahub/validationErrors/error)"),
      "The xdmp:validate function reports the two missing elements as a single error, presumably " +
      "because they're the same type of error")
  ];

  const validationError = fn.head(envelope.xpath("/*:envelope/*:headers/datahub/validationErrors/error"));

  assertions.concat(
    test.assertEqual("XDMP-VALIDATEMISSINGELT", fn.string(validationError.xpath("./code/text()"))),
    test.assertEqual("Missing required elements", fn.string(validationError.xpath("./message/text()"))),
    test.assertTrue(fn.string(validationError.xpath("./*:formatString/text()")).indexOf("Missing required elements: Expected (FirstName,LastName") > -1),

    test.assertEqual("FirstName", fn.string(validationError.xpath("./formattedMessages/formattedMessage[1]/propertyName/text()"))),
    test.assertEqual("Required FirstName property not found", fn.string(validationError.xpath("./formattedMessages/formattedMessage[1]/message/text()"))),
    test.assertEqual("LastName", fn.string(validationError.xpath("./formattedMessages/formattedMessage[2]/propertyName/text()"))),
    test.assertEqual("Required LastName property not found", fn.string(validationError.xpath("./formattedMessages/formattedMessage[2]/message/text()")))
  );
}
