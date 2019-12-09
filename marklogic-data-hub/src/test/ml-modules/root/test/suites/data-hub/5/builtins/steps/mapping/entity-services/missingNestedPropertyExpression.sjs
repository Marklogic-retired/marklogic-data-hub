const lib = require("lib/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

if (mappingLib.versionIsCompatibleWithES()) {
  let result = lib.invokeTestMapping("/content/person1.json", "PersonMapping", "1");
  let person = result.Person;
  [
    test.assertEqual("111", fn.string(person.id),
      "The mapping should still succeed even though there's no sourcedFrom expression for the nested 'name' property. " +
      "In this scenario, the mapping expression should be ignored instead of an error being thrown."),
    test.assertFalse(person.hasOwnProperty("name"), "The name property should not be set since the mapping expression did not " +
      "specify a sourcedFrom for 'name'.")
  ];
}
