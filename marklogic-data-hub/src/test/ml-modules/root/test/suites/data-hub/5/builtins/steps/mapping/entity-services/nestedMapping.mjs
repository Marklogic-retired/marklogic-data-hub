import lib from "/test/suites/data-hub/5/builtins/steps/mapping/entity-services/lib/lib.mjs";
const test = require("/test/test-helper.xqy");

function checkAssertions(person) {
  return [
    test.assertEqual("222", fn.string(person.id)),
    test.assertEqual("Middle", fn.string(person.name.Name.middle)),
    test.assertEqual("Last", fn.string(person.name.Name.last)),
    test.assertEqual("First", fn.string(person.name.Name.first.FirstName.value)),
    test.assertEqual("SomePrefix", fn.string(person.name.Name.first.FirstName.prefix))
  ];
}

let assertions = [];
let result = lib.invokeTestMapping("/content/person2.json", "PersonMapping", "3");
let person = result.Person;
assertions = assertions.concat(checkAssertions(person));
result = lib.invokeTestMapping("/content/person3.xml", "PersonMapping4", "4");
person = result.Person;
assertions = assertions.concat(checkAssertions(person));

assertions;
