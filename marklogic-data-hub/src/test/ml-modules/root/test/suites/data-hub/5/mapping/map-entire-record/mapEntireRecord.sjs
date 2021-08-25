const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const datahub = DataHubSingleton.instance();
let assertions = [];


let content = ['/content/mapEntireRecord.json'].map(uri => {
  return {
    uri: uri,
    value: fn.head(xdmp.unquote('{"envelope": { "headers": { "createdBy": "admin"}, "instance": {"CustomerID": 101} } }'))
  };
});
datahub.flow.runFlow('simpleMappingFlow', 'testJob1', content, {outputFormat: 'json', mapping:{name:'mappingStep1'}}, 1);
const mappedCustomerInstanceJSON = hubTest.getRecord("/content/mapEntireRecord.json").document;

assertions = assertions.concat([
  test.assertEqual(101, mappedCustomerInstanceJSON.envelope.instance.Customer.customerId),
  test.assertEqual("admin", mappedCustomerInstanceJSON.envelope.instance.Customer.name)
]);

content = ['/content/mapEntireRecord.xml'].map(uri => {
  return {
    uri: uri,
    value: fn.head(xdmp.unquote('<envelope xmlns="http://marklogic.com/entity-services"> <headers><createdBy xmlns="">admin</createdBy></headers> <triples/> ' +
      '<instance> <CustOrders xmlns="custOrderInfo"><CustomerID>201</CustomerID></CustOrders></instance></envelope>'))
  };
});

datahub.flow.runFlow('simpleMappingFlow', 'testJob2', content, {outputFormat: 'xml', mapping:{name:'mappingStep2'}}, 2);
const mappedCustomerInstanceXML = hubTest.getRecord("/content/mapEntireRecord.xml").document;
const actualCustomerID = String(mappedCustomerInstanceXML.xpath('*:envelope/*:instance/Customer/customerId/text()'));
const actualName = String(mappedCustomerInstanceXML.xpath('*:envelope/*:instance/Customer/name/text()'));
assertions = assertions.concat([
  test.assertEqual("201", actualCustomerID ),
  test.assertEqual("admin", actualName)
]);



const mappingStep = cts.doc("/steps/mapping/mappingStep1.step.json").toObject();
const result = esMappingLib.validateAndTestMapping(mappingStep, "/content/person1.json");
assertions = assertions.concat([
  test.assertEqual(101, fn.number(result.properties.customerId.output), `Expected output '101', got '${xdmp.describe(result.properties.customerId)}'`),
  test.assertEqual("admin", result.properties.name.output, `Expected output 'admin', got '${xdmp.describe(result.properties.name)}'`),
]);


assertions;

