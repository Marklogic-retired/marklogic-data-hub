const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const lib = require("lib/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const contentUri = "/content/person2.json";

function verifyUriIsResolvedByMappingStep() {
  const person = lib.invokeTestMapping(contentUri, "PersonMapping", "7").Person;
  return [
    test.assertEqual(contentUri, fn.string(person.nickname),
      "The nickname is mapped to the $URI variable which is expected to be populated by the mapper")
  ];
}

function verifyUriResolvedWhenTestingMapping() {
  const result = esMappingLib.validateAndRunMapping({
    targetEntityType: "http://marklogic.com/data-hub/example/Person-1.0.0/Person",
    properties: {
      nickname: {sourcedFrom: "$URI"}
    }
  }, contentUri);

  return [
    test.assertEqual("$URI", result.properties.nickname.sourcedFrom),
    test.assertEqual(contentUri, result.properties.nickname.output)
  ];
}

function verifyMappingContainsUriParam() {
  const xmlMapping = hubTest.getModulesDocument("/mappings/PersonMapping/PersonMapping-7.mapping.xml");
  const stylesheet = hubTest.getModulesDocument("/mappings/PersonMapping/PersonMapping-7.mapping.xml.xslt");
  return [
    test.assertTrue(fn.head(xmlMapping.xpath("/*:mapping/*:param[@name = 'URI']")) != null),
    test.assertTrue(fn.head(stylesheet.xpath("/*:stylesheet/*:param[@name = 'URI']")) != null)
  ]
}

[]
  .concat(verifyUriIsResolvedByMappingStep())
  .concat(verifyUriResolvedWhenTestingMapping())
  .concat(verifyMappingContainsUriParam());
