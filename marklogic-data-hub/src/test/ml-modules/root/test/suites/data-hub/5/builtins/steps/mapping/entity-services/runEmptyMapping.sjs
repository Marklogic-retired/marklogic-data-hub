const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];

//Only 'id' is mapped. Other properties shouldn't be present in entity instance
function runStructuredPropertyMapping () {
  let doc = fn.head(xdmp.unquote(`{"id":1,"customer":{"firstName":"Oralia"},"items":[{"name":"Voltsillam"},{"name":"Latlux"}]}`));
  let result = mapping.main({uri: '/test.json', value: doc}, {
    mapping: {name: 'OrdersMapping', version: 4},
    outputFormat: 'json'
  }).value.root;
  let instance = result.envelope.instance;
  assertions = assertions.concat([
    test.assertEqual(null, instance.OrderType.customer),
    test.assertEqual(null, instance.OrderType.items),
    test.assertEqual("1", fn.string(instance.OrderType.id))
  ]);
}

//None of the entity properties are mapped, so 'CustomerType' shouldn't be present in entity instance
function runSimplePropertyMapping() {
  let doc = fn.head(xdmp.unquote(`{"id":1}`));
  let result = mapping.main({uri: '/test.json', value: doc}, {
    mapping: {name: 'CustomerMapping', version: 1},
    outputFormat: 'json'
  }).value.root;
  let instance = result.envelope.instance;
  assertions = assertions.concat([
    test.assertEqual(null, instance.CustomerType)
  ]);
}

runStructuredPropertyMapping();
runSimplePropertyMapping();

assertions;
