const test = require("/test/test-helper.xqy");
const mapping = require("/data-hub/5/builtins/steps/mapping/default/main.sjs");
const emptySequence = Sequence.from([]);

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function mapsJSONasExpected() {
  const mappedInstance = mapping.main({"value": cts.doc("/customer1.json")}, {
    "mapping" : {
      "name" : "CustomerJSON-CustomerJSONMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.envelope.instance.Customer;
  return [
    test.assertEqual("Bob", mappedInstance.firstname, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", mappedInstance.id, `Unexpected output: ${describe(mappedInstance)}`)
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
    test.assertEqual("Bob", fn.string(mappedInstance.xpath('./firstname')), `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", fn.string(mappedInstance.xpath('./id')),`Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("2000-01-01", fn.string(mappedInstance.xpath('./updated')),`Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual(3, fn.count(mappedInstance.xpath('./interests')), `Unexpected output: ${describe(mappedInstance)}`)
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
  return [
    test.assertEqual("Bob", mappedInstance.firstname, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", mappedInstance.id, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual(3, mappedInstance.interests.length, `Unexpected output: ${describe(mappedInstance)}`)
  ];
}

[]
  .concat(mapsJSONasExpected())
  .concat(mapsJSONtoXMLasExpected())
  .concat(mapsXMLasExpected());
