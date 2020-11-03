'use strict';

const test = require("/test/test-helper.xqy");
const utils = require('/test/suites/data-hub/5/data-services/lib/mappingService.sjs').DocumentForTestingUtils;

const assertions = [];

const result = utils.invokeService(utils.STEP_NAME, '/content/sampleCustomerDoc.xml');
const orderProp = result.data['OrderNS:Order'];
let markupScenariosProp;
if (orderProp) {
  markupScenariosProp = orderProp['OrderNS:MarkupScenarios'];
}

const expectedNamespaces = {
  "OD": "https://www.w3schools.com/OD",
  "OtherNS": "https://www.w3schools.com/OtherNS",
  "Wash": "https://www.w3schools.com/Washington",
  "Omega": "Omega",
  "Cali": "https://www.w3schools.com/California",
  "Product": "https://www.w3schools.com/ProductNS",
  "SD": "https://www.w3schools.com/SD1",
  "SD2": "https://www.w3schools.com/SD2",
  "OrderNS": "https://www.w3schools.com/OrderNS",
  "SV": "https://www.w3schools.com/SV",
  "Gamma": "https://www.microsoft.com/Gamma",
  "Gamma2": "https://www.amazon.com/Gamma"
};

assertions.concat([
  test.assertExists(result.data, 'Top-level "data" property does not exist'),
  test.assertExists(orderProp, "The data's first property is expected to be 'OrderNS:Order'"),
  test.assertEqual("this attr should be 'in' in the output", String(orderProp['OD:OrderDetails']['@in']),
    "Unexpected value for the 'in' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])),
  test.assertEqual("this attr should be 'in2' in the output", String(orderProp['OD:OrderDetails']['@in2']),
    "Unexpected value for the 'in2' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])),
  test.assertEqual("this attr should be '@OtherNS:out' in the output", String(orderProp['OD:OrderDetails']['@OtherNS:out']),
    "Unexpected value for the 'OrderNS:out' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])),
  test.assertExists(orderProp['OrderNS:ShippedDate']),
  test.assertTrue(Array.isArray(orderProp['OrderNS:ShippedDate']) && orderProp['OrderNS:ShippedDate'].length === 2,
    "OrderNS:ShippedDate should be an array with two items but is " + JSON.stringify(orderProp['OrderNS:ShippedDate'])),
  test.assertExists(orderProp['SV:ShipVia']),
  test.assertExists(orderProp['OrderNS:ShipPostalCode'], "Looks like the default namespace did not revert."),
  test.assertEqual("Should *not* be in an array.", String(orderProp['Gamma:Element1']),
    "Gamma:Element1 should just be a string as next Element1 is in a different namespace"),
  test.assertEqual("Should *not* be in an array.", String(orderProp['Gamma2:Element1']),
    "Gamma2:Element1 should just be a string as previous Element1 is in a different namespace"),
  test.assertTrue(Array.isArray(orderProp['OrderNS:Element2']) && orderProp['OrderNS:Element2'].length === 2,
    "OrderNS:Element2 should be an array with two items but is " + JSON.stringify(orderProp['OrderNS:Element2'])),
  test.assertExists(markupScenariosProp, 'Missing OrderNS:Order.OrderNS:MarkupScenarios in ' +
    JSON.stringify(result.data)),
  test.assertExists(markupScenariosProp['OrderNS:EmptyElementWithoutAttributes']),
  test.assertEqual('', String(markupScenariosProp['OrderNS:EmptyElementWithoutAttributes']),
    'Expected the OrderNS:EmptyElementWithoutAttributes property value to be an empty string.'),
  test.assertExists(markupScenariosProp['OrderNS:EmptyElementWithAttribute']),
  test.assertEqual('hello', String(markupScenariosProp['OrderNS:EmptyElementWithAttribute']['@attr']),
    'Expected OrderNS:EmptyElementWithAttribute to have the "@attr" property set to "hello".'),
  test.assertExists(markupScenariosProp['OrderNS:NoTextOrAttrs']),
  test.assertEqual('', String(markupScenariosProp['OrderNS:NoTextOrAttrs']),
    'Expected the OrderNS:NoTextOrAttrs property value to be an empty string.'),
  test.assertExists(markupScenariosProp['OrderNS:JustText']),
  test.assertEqual('Hello', String(markupScenariosProp['OrderNS:JustText']),
    'Expected the OrderNS:JustText property value to be "Hello".'),
  test.assertExists(markupScenariosProp['OrderNS:JustAttr']),
  test.assertEqual('Howdy', String(markupScenariosProp['OrderNS:JustAttr']['@attr']),
    'Expected OrderNS:JustAttr to have the "@attr" property set to "Howdy".'),
  test.assertExists(markupScenariosProp['OrderNS:AttrAndText']),
  test.assertEqual('Some Text', String(markupScenariosProp['OrderNS:AttrAndText']['#text']),
    'Expected OrderNS:AttrAndText to have text of "Some Text".'),
  test.assertEqual('myattr', String(markupScenariosProp['OrderNS:AttrAndText']['@attr']),
    'Expected OrderNS:AttrAndText to have the "@attr" property set to "myattr".'),
  test.assertExists(markupScenariosProp['OrderNS:MultipleTextNodes']),
  test.assertEqual('1st text node2nd text node', String(markupScenariosProp['OrderNS:MultipleTextNodes']['#text']),
    'While not desired, expected the two text nodes in OrderNS:MultipleTextNodes to be concatenated.'),
  test.assertExists(markupScenariosProp['OrderNS:ExampleWithCDATA']),
  test.assertEqual('Text outside Text inside More text outside', String(markupScenariosProp['OrderNS:ExampleWithCDATA']),
    'Expected text nodes to be concatenated with CDATA content.'),
  test.assertEqualJson(expectedNamespaces, result.namespaces, 'The namespaces do not match; expected ' +
    JSON.stringify(expectedNamespaces) + ' but got ' + JSON.stringify(result.namespaces)),
  test.assertEqual('XML', String(result.format))
]);

assertions;
