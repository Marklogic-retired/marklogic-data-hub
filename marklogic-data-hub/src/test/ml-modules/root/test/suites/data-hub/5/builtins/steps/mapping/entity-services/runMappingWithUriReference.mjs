import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
import lib from "/test/suites/data-hub/5/builtins/steps/mapping/entity-services/lib/lib.mjs";
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");

const contentUri = "/content/person2.json";

function verifyUriIsResolvedByMappingStep() {
  const person = lib.invokeTestMapping(contentUri, "PersonMapping7", "7").Person;
  return [
    test.assertEqual(contentUri, fn.string(person.nickname),
      "The nickname is mapped to the $URI variable which is expected to be populated by the mapper")
  ];
}

function verifyUriResolvedWhenTestingMapping() {
  const result = esMappingLib.validateAndTestMapping({
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
  const xmlMapping = hubTest.getModulesDocument("/steps/mapping/PersonMapping7.step.xml");
  const stylesheet = hubTest.getModulesDocument("/steps/mapping/PersonMapping7.step.xml.xslt");
  return [
    test.assertTrue(fn.head(xmlMapping.xpath("/*:mapping/*:param[@name = 'URI']")) != null),
    test.assertTrue(fn.head(stylesheet.xpath("/*:stylesheet/*:param[@name = 'URI']")) != null)
  ]
}

[]
  .concat(verifyUriIsResolvedByMappingStep())
  .concat(verifyUriResolvedWhenTestingMapping())
  .concat(verifyMappingContainsUriParam());
