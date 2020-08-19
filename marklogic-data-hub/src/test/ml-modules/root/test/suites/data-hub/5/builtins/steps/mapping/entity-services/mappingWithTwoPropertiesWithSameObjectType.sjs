const hubTest = require("/test/data-hub-test-helper.xqy");
const lib = require("lib/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

// First verify that the nested object properties were processed correctly in the XML mapping template
// Each template should have a name that is unique based on the path of the property that it references
const mappingTemplate = hubTest.getModulesDocument("/mappings/PersonMapping/PersonMapping-6.mapping.xml");
const namespaces = {"m": "http://marklogic.com/entity-services/mapping"};
const assertions = [
  test.assertEqual("Person.name", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person']/Person/m:for-each/name/m:call-template/@name/string()", namespaces)),
  test.assertEqual("Person.alias", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person']/Person/m:for-each/alias/m:call-template/@name/string()", namespaces)),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person.name']", namespaces).toArray().length),
  test.assertEqual("Person.name.first", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person.name']/Name/m:for-each/first/m:call-template/@name/string()", namespaces)),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person.name.first']", namespaces).toArray().length),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'Person.alias']", namespaces).toArray().length)

];

const person = lib.invokeTestMapping("/content/person2.json", "PersonMapping", "6").Person;

assertions.push(
  test.assertEqual("222", fn.string(person.id)),
  test.assertEqual("Nicky", fn.string(person.nickname)),
  test.assertEqual("First", fn.string(person.name.Name.first.FirstName.value),
    "This verifies that when two properties are mapped to entities of the same type, the " +
    "templates that are generated have unique names"),
  test.assertEqual("SomePrefix", fn.string(person.name.Name.first.FirstName.prefix)),
  test.assertEqual("Last", fn.string(person.name.Name.last)),
  test.assertEqual("Middle", fn.string(person.alias.Name.middle))
);

assertions;
