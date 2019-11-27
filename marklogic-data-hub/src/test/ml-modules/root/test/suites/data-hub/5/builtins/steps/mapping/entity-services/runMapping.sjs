const lib = require("lib/lib.sjs");
const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];
function runMapping () {
  let doc = fn.head(xdmp.unquote(`{"id":1,"transactionDate":"12/7/2019","customer":{"firstName":"Oralia","lastName":"Dinesen","gender":"F"},"items":[{"name":"Voltsillam","price":2.0,"quantity":7},{"name":"Latlux","price":7.17,"quantity":10},{"name":"Biodex","price":5.01,"quantity":2},{"name":"Fixflex","price":8.77,"quantity":6},{"name":"Keylex","price":5.57,"quantity":3}]}`));
  let result = mapping.main({uri: '/test.json', value: doc}, {
    mapping: {name: 'OrdersMapping', version: 1},
    outputFormat: 'json'
  }).value.root;
  let instance = result.envelope.instance;
  try {
    assertions = assertions.concat([
      test.assertEqual('2019-12-07', fn.string(instance.OrderType.purchaseDate)),
      test.assertEqual(165.05, fn.number(instance.OrderType.orderCost)),
      test.assertEqual('Female', fn.string(instance.OrderType.customer.CustomerType.gender), `Ge`)
    ]);
  } catch (e) {
    assertions.push(
      test.assertFalse(
        fn.true(),
        `Error "${e.toString()}" encountered testing instance '${xdmp.describe(instance, Sequence.from([]), Sequence.from([]))}'`
      )
    );
  }
}

function runMappingJsonToXml() {
  let doc = fn.head(xdmp.unquote(`{"id":1,"transactionDate":"12/7/2019","customer":{"firstName":"Oralia","lastName":"Dinesen","gender":"F"},"items":[{"name":"Voltsillam","price":2.0,"quantity":7},{"name":"Latlux","price":7.17,"quantity":10},{"name":"Biodex","price":5.01,"quantity":2},{"name":"Fixflex","price":8.77,"quantity":6},{"name":"Keylex","price":5.57,"quantity":3}]}`));
  let result = mapping.main({uri: '/test.json', value: doc}, {
    mapping: {name: 'OrdersMapping', version: 1},
    outputFormat: 'xml'
  });
  let instance = fn.head(result.value.xpath('/*:envelope/*:instance'));
  try {
    assertions = assertions.concat([
      test.assertEqual('/test.xml', fn.string(result.uri)),
      test.assertEqual('2019-12-07', fn.string(instance.xpath('*:OrderType/*:purchaseDate'))),
      test.assertEqual(165.05, fn.number(instance.xpath('*:OrderType/*:orderCost'))),
      test.assertEqual('Female', fn.string(instance.xpath('*:OrderType/*:customer/*:CustomerType/*:gender')), `Ge`)
    ]);
  } catch (e) {
    assertions.push(
      test.assertFalse(
        fn.true(),
        `Error "${e.toString()}" encountered testing instance '${xdmp.describe(instance, Sequence.from([]), Sequence.from([]))}'`
      )
    );
  }
}

function testMapping() {
    let instance = lib.invokeTestMapping("/content/mapTest.json", "OrdersMapping" , "2");
    assertions.concat([
          test.assertEqual('2019-12-07', fn.string(instance.OrderType.purchaseDate)),
          test.assertEqual(11,fn.number(instance.OrderType.id)),
          test.assertEqual(165.05, fn.number(instance.OrderType.orderCost))]);
}

if (mappingLib.versionIsCompatibleWithES()) {
  runMapping();
  runMappingJsonToXml();
  testMapping();
}
assertions;
