const test = require("/test/test-helper.xqy");
const mapping = require("/data-hub/5/builtins/steps/mapping/default/main.sjs");

function mapsJSONasExpected() {
  const mappedInstance = mapping.main({"value": cts.doc("/customer1.json")}, {
    "mapping" : {
      "name" : "CustomerJSON-CustomerJSONMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.envelope.instance.Customer;
  return [
    test.assertEqual(mappedInstance.firstname, "Bob"),
    test.assertEqual(mappedInstance.id, "Customer-1234")
  ];
}

function mapsXMLasExpected() {
  const mappedInstance = mapping.main({"value": cts.doc("/customer1.xml")}, {
    "mapping" : {
      "name" : "CustomerXML-CustomerXMLMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.envelope.instance.Customer;
  mapping.mapping
  return [
    test.assertEqual(mappedInstance.firstname, "Bob"),
    test.assertEqual(mappedInstance.id, "Customer-1234")
  ];
}

[]
  .concat(mapsJSONasExpected())
  .concat(mapsXMLasExpected());
