const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

/*
The following formatString is expected for this scenario:

XDMP-VALIDATEUNEXPECTED: (err:XQDY0027) validate full strict { () } -- Invalid node: Found LastName but expected (FirstName,LastName,Email?) at
fn:doc("/mappings/CustomerMapping/CustomerMapping-0.mapping.xml.xslt")/Customer/LastName using schema "/entities/Customer.entity.xsd"
 */
if (esMappingLib.versionIsCompatibleWithES()) {
  const envelope = lib.mapInstance("/content/customer-missing-first-name.xml", "accept", "xml").value;

  let assertions = [
    test.assertEqual(1, envelope.xpath("count(/*:envelope/*:headers/datahub/validationErrors/error)"),
      "Should have a validation error for the missing first name")
  ];

  const validationError = fn.head(envelope.xpath("/*:envelope/*:headers/datahub/validationErrors/error"));

  assertions.concat(
    test.assertEqual("XDMP-VALIDATEUNEXPECTED", fn.string(validationError.xpath("./code/text()")),
      "When there's a missing element and it's the first element in the entity instance, we get an "),

    test.assertEqual("Invalid node", fn.string(validationError.xpath("./message/text()"))),

    test.assertTrue(fn.string(validationError.xpath("./*:formatString/text()"))
      .indexOf("Invalid node: Found LastName but expected (FirstName,LastName,Email?") > -1),

    test.assertEqual("FirstName", fn.string(validationError.xpath("./formattedMessages/formattedMessage/propertyName/text()"))),
    test.assertEqual("Required FirstName property not found", fn.string(validationError.xpath("./formattedMessages/formattedMessage/message/text()")))
  );
}
