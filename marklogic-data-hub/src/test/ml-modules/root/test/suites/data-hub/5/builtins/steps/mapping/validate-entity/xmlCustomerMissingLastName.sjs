const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

/*
The following formatString is expected for this scenario - even though there's only one missing element:

XDMP-VALIDATEMISSINGELT: (err:XQDY0027) validate full strict { () } -- Missing required elements: Expected (LastName,Email?)
at fn:doc("/mappings/CustomerMapping/CustomerMapping-0.mapping.xml.xslt")/Customer using schema "/entities/Customer.entity.xsd"
 */
if (esMappingLib.versionIsCompatibleWithES()) {
  const envelope = lib.mapInstance("/content/customer-missing-last-name.xml", "accept", "xml").value;

  let assertions = [
    test.assertEqual(1, envelope.xpath("count(/*:envelope/*:headers/datahub/validationErrors/error)"),
      "Should have a validation error for the missing last name")
  ];

  const validationError = fn.head(envelope.xpath("/*:envelope/*:headers/datahub/validationErrors/error"));

  assertions.concat(
    test.assertEqual("XDMP-VALIDATEMISSINGELT", fn.string(validationError.xpath("./code/text()"))),

    test.assertEqual("Missing required elements", fn.string(validationError.xpath("./message/text()")),
      "xdmp.validate returns this message even though there's only one missing required element; if the email property " +
      "was set, then we'd actually get an XDMP-VALIDATEUNEXPECTED error code and the associated error message"),

    test.assertTrue(fn.string(validationError.xpath("./*:formatString/text()"))
      .indexOf("Missing required elements: Expected (LastName,Email?") > -1),

    test.assertEqual("LastName", fn.string(validationError.xpath("./formattedMessages/formattedMessage/propertyName/text()"))),
    test.assertEqual("Required LastName property not found", fn.string(validationError.xpath("./formattedMessages/formattedMessage/message/text()")))
  );
}
