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

function mapsJSONtoXMLasExpected() {
  const mappedInstance = fn.head(mapping.main({"value": cts.doc("/customer1.json")}, {
    "mapping" : {
      "name" : "CustomerJSON-CustomerJSONMapping",
      "version" : 0
    },
    "targetEntity" : "Customer",
    "outputFormat": "xml"
  }).value.xpath('/*:envelope/*:instance/*:Customer'));
  return [
    test.assertEqual(fn.string(mappedInstance.xpath('./firstname')), "Bob"),
    test.assertEqual(fn.string(mappedInstance.xpath('./id')), "Customer-1234"),
    test.assertEqual(fn.count(mappedInstance.xpath('./interests')),3)
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
    test.assertEqual(mappedInstance.id, "Customer-1234"),
    test.assertEqual(mappedInstance.interests.length, 3)
  ];
}

[]
  .concat(mapsJSONasExpected())
  .concat(mapsJSONtoXMLasExpected())
  .concat(mapsXMLasExpected());
