const lib = require("lib/lib.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

if (mappingLib.versionIsCompatibleWithES()) {
  let result = lib.invokeTestMapping("/content/person1.json", "PersonMapping", "2");
  let person = result.Person;
  [
    test.assertEqual("111", fn.string(person.id)),
    test.assertFalse(person.hasOwnProperty("nickname"),
      "If the sourcedFrom expression is empty, it should be ignored so that an error is not thrown")
  ];
}
