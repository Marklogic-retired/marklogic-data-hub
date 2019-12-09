const test = require("/test/test-helper.xqy");
const mapping = require("/data-hub/5/builtins/steps/mapping/default/main.sjs");
const esMapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const emptySequence = Sequence.from([]);
const serverTimezone = sem.timezoneString(fn.currentDateTime());
let expectedDateTime = `2014-01-06T18:13:50${serverTimezone}`;

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function mapsJSONasExpected() {
  const mappedInstance = esMapping.main({"value": cts.doc("/customer1.json")}, {
    "mapping" : {
      "name" : "CustomerJSON-CustomerJSONMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.root.envelope.instance.Customer;
  const message = `Unexpected output: ${describe(mappedInstance)}`;
  return [
    test.assertEqual("Bob", fn.string(mappedInstance.firstname), message),
    test.assertEqual("Customer-1234", fn.string(mappedInstance.id), message)
  ]
}

function esMapsJSONasExpected() {
  const mappedInstance = esMapping.main({"value": cts.doc("/customer1.json")}, {
    "mapping" : {
      "name" : "CustomerJSON-CustomerJSONMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.toObject().envelope.instance.Customer;
  const message = `Unexpected output: ${describe(mappedInstance)}`;
  return [
    test.assertEqual(15, mappedInstance.sum, message),
    test.assertEqual(0, mappedInstance.difference, message),
    test.assertEqual(100, mappedInstance.product, message),
    test.assertEqual(2.5, mappedInstance.quotient, message),
    test.assertEqual(10, mappedInstance.firstNumber, message),
    test.assertEqual(null, mappedInstance.secondNumber, message),
    test.assertEqual(10, mappedInstance.thirdNumber, message),
    test.assertEqual(10, mappedInstance.fourthNumber, message),
    test.assertEqual(null, mappedInstance.fifthNumber, message),
    test.assertEqual(null, mappedInstance.sixthNumber, message),
    test.assertEqual("Bob Cratchit", mappedInstance.stringJoin, message),
    test.assertEqual("Customer-123", mappedInstance.stringRemove, message),
    test.assertEqual(expectedDateTime,mappedInstance.currentDateTime,message),
    test.assertEqual("2014-01-06",mappedInstance.currentDate,message)
  ];
}

function mapsJSONtoXMLasExpected() {
  const mappedInstance = fn.head(esMapping.main({"value": cts.doc("/customer1.json")}, {
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
  const mappedInstance = esMapping.main({"value": cts.doc("/customer1.xml")}, {
    "mapping" : {
      "name" : "CustomerXML-CustomerXMLMapping",
      "version" : 0
    },
    "targetEntity" : "Customer"
  }).value.toObject().envelope.instance.Customer;
  return [
    test.assertEqual("Bob", mappedInstance.firstname, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", mappedInstance.id, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual(3, mappedInstance.interests.length, `Unexpected output: ${describe(mappedInstance)}`)
  ];
}

function versionIsCompatibleWithESTest() {
  return [
    test.assertEqual(true, esMappingLib.versionIsCompatibleWithES("9.0-20190924")),
    test.assertEqual(true, esMappingLib.versionIsCompatibleWithES("9.0-11")),
    test.assertEqual(true, esMappingLib.versionIsCompatibleWithES("10.0-20190826")),
    test.assertEqual(true, esMappingLib.versionIsCompatibleWithES("10.0-2.1")),
    test.assertEqual(false, esMappingLib.versionIsCompatibleWithES("9.0-20190810")),
    test.assertEqual(false, esMappingLib.versionIsCompatibleWithES("9.0-9.19")),
    test.assertEqual(false, esMappingLib.versionIsCompatibleWithES("10.0-1.4"))
  ]
}

let assertions = [];
if (esMappingLib.versionIsCompatibleWithES()) {
  assertions = assertions
    .concat(mapsJSONasExpected())
    .concat(esMapsJSONasExpected())
    .concat(mapsJSONtoXMLasExpected())
    .concat(mapsXMLasExpected())
    .concat(versionIsCompatibleWithESTest());

}
assertions;
