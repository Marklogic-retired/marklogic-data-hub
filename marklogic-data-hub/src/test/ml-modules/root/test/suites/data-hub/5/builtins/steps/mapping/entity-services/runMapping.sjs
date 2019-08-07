const mapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const test = require("/test/test-helper.xqy");

let doc = fn.head(xdmp.unquote(`{"id":1,"transactionDate":"12/7/2019","customer":{"firstName":"Oralia","lastName":"Dinesen","gender":"F"},"items":[{"name":"Voltsillam","price":2.0,"quantity":7},{"name":"Latlux","price":7.17,"quantity":10},{"name":"Biodex","price":5.01,"quantity":2},{"name":"Fixflex","price":8.77,"quantity":6},{"name":"Keylex","price":5.57,"quantity":3}]}`));
let result = mapping.main({uri:'/test.json', value: doc}, { mapping: {name: 'OrdersMapping', version: 1}, outputFormat: 'json'}).value.root;
let instance = result.envelope.instance;
let assertions = [
  test.assertEqual('2019-12-07', fn.string(instance.OrderType.purchaseDate)),
  test.assertEqual(165.05, fn.number(instance.OrderType.orderCost)),
  test.assertEqual('Female', fn.string(instance.OrderType.customer.gender))
];

assertions;
