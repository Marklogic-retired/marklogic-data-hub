const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

let doc = fn.head(xdmp.unquote(`{"items":[1,2,3],"name":"John"}`));
let result = mapping.main({uri: '/test.json', value: doc}, {
  mapping: {name: 'mappingStep1'},
  outputFormat: 'json'
}).value.root;

let instance = result.envelope.instance;
assertions = assertions.concat([
  test.assertEqual('John', fn.string(instance.Customer.name)),
  test.assertEqual(3, fn.number(instance.Customer.integers.length)),
  test.assertEqual(2, fn.number(instance.Customer.integers[0])),
  test.assertEqual(3, fn.number(instance.Customer.integers[1])),
  test.assertEqual(4, fn.number(instance.Customer.integers[2]))
]);
assertions
