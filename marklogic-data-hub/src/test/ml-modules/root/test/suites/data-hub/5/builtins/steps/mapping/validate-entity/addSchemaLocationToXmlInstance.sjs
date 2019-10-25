const entityValidationLib = require("/data-hub/5/builtins/steps/mapping/entity-services/entity-validation-lib.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

let person = entityValidationLib.addSchemaLocationToXmlInstance(
  xdmp.unquote('<Person test="person"><FirstName test="first">first</FirstName><LastName>last</LastName></Person>'),
  {"title": "Person"}
);

assertions.push(
  test.assertEqual("/entities/Person.entity.xsd", person.xpath("/Person/@xsi:schemaLocation/string()"),
    "Both schemaLocation and noNamespaceSchemaLocation are added so we don't have to bother checking to see if the schema specifies a namespace or not"),
  test.assertEqual("/entities/Person.entity.xsd", person.xpath("/Person/@xsi:noNamespaceSchemaLocation/string()")),

  test.assertEqual("person", person.xpath("/Person/@test/string()"), "Just making sure the xsl transform didn't drop anything"),
  test.assertEqual("first", person.xpath("/Person/FirstName/@test/string()")),
  test.assertEqual("first", person.xpath("/Person/FirstName/string()")),
  test.assertEqual("last", person.xpath("/Person/LastName/string()"))
);

// Verify that if existing schemaLocation/noNamespaceSchemaLocation attributes exist, they don't cause a failure
person = entityValidationLib.addSchemaLocationToXmlInstance(
  xdmp.unquote(
    '<Person xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="test" xsi:noNamespaceSchemaLocation="test" test="person">' +
    '<FirstName test="first">first</FirstName><LastName>last</LastName>' +
    '</Person>'),
  {"title": "Person"}
);

assertions.push(
  test.assertEqual("/entities/Person.entity.xsd", person.xpath("/Person/@xsi:schemaLocation/string()"),
    "Both schemaLocation and noNamespaceSchemaLocation are added so we don't have to bother checking to see if the schema specifies a namespace or not"),
  test.assertEqual("/entities/Person.entity.xsd", person.xpath("/Person/@xsi:noNamespaceSchemaLocation/string()"))
);

assertions;
