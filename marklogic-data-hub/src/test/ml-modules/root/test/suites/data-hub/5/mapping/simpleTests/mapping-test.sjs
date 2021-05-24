/**
 * This module was originally under "com/marklogic/hub" and used a custom way of setting up a project.
 * The test would fail intermittently due to the setup. This now uses hubTest to setup a project. I had looked
 * into getting rid of the test completely as I know we have a lot of JSON mapping tests, but I don't know how we're
 * doing on JSON->XML or XML->JSON mapping tests, so I kept this.
 */

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const emptySequence = Sequence.from([]);
const serverTimezone = sem.timezoneString(fn.currentDateTime());

let expectedDateTime = `2014-01-06T18:13:50${serverTimezone}`;

const jsonCustomer = {
  "uri": "/customer1.json",
  "value": {
    "envelope": {
      "instance": {
        "Metadata": {
          "CreatedOn": "2000-01-01"
        },
        "FirstName": "Bob",
        "CustomerID": "Customer-1234",
        "Interests": [
          "astronomy",
          "baseball",
          "programming"
        ],
        "Misc": [
          123,
          true,
          null,
          { "info": "text" }
        ],
        "Number": 10,
        "AnotherNumber": 5,
        "CurrentDateTime": "06/01/2014-18:13:50",
        "CurrentDate": "Jan 06, 2014"
      }
    }
  }
};

const xmlCustomerString = "<es:envelope xmlns:es='http://marklogic.com/entity-services'><es:instance>" +
  "<ns1:Customer xmlns:ns1='http://ns1' xmlns:ns2='http://ns2' CustomerID='Customer-1234'>" +
  "<ns2:property name='name' value='Bob' />" +
  "<ns2:property name='interest' value='baseball' />" +
  "<ns2:property name='interest' value='astronomy' />" +
  "<ns2:property name='interest' value='programming' />" +
  "</ns1:Customer></es:instance></es:envelope>";

const xmlCustomer = {
  "uri": "/customer1.xml",
  "value": fn.head(xdmp.unquote(xmlCustomerString))
};

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function mapsJSONasExpected() {
  const mappedInstance = flowApi.runFlowStepOnContent("simpleMappingFlow", "1", [jsonCustomer]).contentArray[0].value.toObject().envelope.instance.Customer;
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
    test.assertEqual(expectedDateTime, mappedInstance.currentDateTime, message),
    test.assertEqual("2014-01-06", mappedInstance.currentDate, message)
  ];
}

function mapsJSONtoXMLasExpected() {
  let mappedInstance = flowApi.runFlowStepOnContent("simpleMappingFlow", "1", [jsonCustomer],
    { "outputFormat": "xml" }).contentArray[0].value;
  mappedInstance = fn.head(mappedInstance.xpath('/*:envelope/*:instance/*:Customer'));
  return [
    test.assertEqual("Bob", fn.string(mappedInstance.xpath('./firstname')), `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", fn.string(mappedInstance.xpath('./id')), `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("2000-01-01", fn.string(mappedInstance.xpath('./updated')), `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual(3, fn.count(mappedInstance.xpath('./interests')), `Unexpected output: ${describe(mappedInstance)}`)
  ];
}

function mapsXMLasExpected() {
  const mappedInstance = flowApi.runFlowStepOnContent("simpleMappingFlow", "2", [xmlCustomer]).contentArray[0].value.toObject().envelope.instance.Customer;
  return [
    test.assertEqual("Bob", mappedInstance.firstname, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual("Customer-1234", mappedInstance.id, `Unexpected output: ${describe(mappedInstance)}`),
    test.assertEqual(3, mappedInstance.interests.length, `Unexpected output: ${describe(mappedInstance)}`)
  ];
}


const assertions = [];
assertions
  .concat(mapsJSONasExpected())
  .concat(mapsJSONtoXMLasExpected())
  .concat(mapsXMLasExpected());

