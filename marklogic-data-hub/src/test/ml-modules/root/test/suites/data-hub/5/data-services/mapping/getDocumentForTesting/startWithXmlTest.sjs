'use strict';

const test = require("/test/test-helper.xqy");
const utils = require('/test/suites/data-hub/5/data-services/lib/mappingService.sjs').DocumentForTestingUtils;
const xmlToJson = require('/data-hub/5/data-services/mapping/xmlToJsonForMapping.sjs');

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

assertions.push(test.assertExists(result.data, 'Top-level "data" property does not exist'));
assertions.push(test.assertExists(orderProp, "The data's first property is expected to be 'OrderNS:Order'"));
// Are the namespaces of these attributes correct in the output?
assertions.push(test.assertEqual("this attr should be 'in' in the output", String(orderProp['OD:OrderDetails']['@in']),
  "Unexpected value for the 'in' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])));
assertions.push(test.assertEqual("this attr should be 'in2' in the output", String(orderProp['OD:OrderDetails']['@in2']),
  "Unexpected value for the 'in2' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])));
assertions.push(test.assertEqual("this attr should be '@OtherNS:out' in the output", String(orderProp['OD:OrderDetails']['@OtherNS:out']),
  "Unexpected value for the 'OrderNS:out' attribute value in " + JSON.stringify(orderProp['OD:OrderDetails'])));
// The two OrderDetail elements should be an array but namespace of children should be different.
assertions.push(test.assertExists(orderProp['OD:OrderDetails']['OD:OrderDetail']));
assertions.push(test.assertTrue(Array.isArray(orderProp['OD:OrderDetails']['OD:OrderDetail']) && orderProp['OD:OrderDetails']['OD:OrderDetail'].length === 2,
  "OD:OrderDetail should be an array with two items but is " + JSON.stringify(orderProp['OD:OrderDetails']['OD:OrderDetail'])));
assertions.push(test.assertExists(orderProp['OD:OrderDetails']['OD:OrderDetail'][0]['Wash:UnitPrice'],
  "The first OD:OrderDetails element should have a Wash:UnitPrice child"));
assertions.push(test.assertExists(orderProp['OD:OrderDetails']['OD:OrderDetail'][1]['Cali:UnitPrice'],
  "The second OD:OrderDetails element should have a Cali:UnitPrice child"));
// ShippedDate should be an array.
assertions.push(test.assertExists(orderProp['OrderNS:ShippedDate']));
assertions.push(test.assertTrue(Array.isArray(orderProp['OrderNS:ShippedDate']) && orderProp['OrderNS:ShippedDate'].length === 2,
  "OrderNS:ShippedDate should be an array with two items but is " + JSON.stringify(orderProp['OrderNS:ShippedDate'])));
// Verify the default namespace changed.
assertions.push(test.assertExists(orderProp['SV:ShipVia']));
// Verify the default namespace immediately reverted.
assertions.push(test.assertExists(orderProp['OrderNS:ShipPostalCode'], "Looks like the default namespace did not revert"));
// More should and should-not-be array tests
assertions.push(test.assertEqual("Should *not* be in an array.", String(orderProp['Gamma:Element1']),
  "Gamma:Element1 should just be a string as next Element1 is in a different namespace"));
assertions.push(test.assertEqual("Should *not* be in an array.", String(orderProp['Gamma2:Element1']),
  "Gamma2:Element1 should just be a string as previous Element1 is in a different namespace"));
assertions.push(test.assertTrue(Array.isArray(orderProp['OrderNS:Element2']) && orderProp['OrderNS:Element2'].length === 2,
  "OrderNS:Element2 should be an array with two items but is " + JSON.stringify(orderProp['OrderNS:Element2'])));
// Entering MarkupScenarios
assertions.push(test.assertExists(markupScenariosProp, 'Missing OrderNS:Order.OrderNS:MarkupScenarios in ' +
  JSON.stringify(result.data)));
// EmptyElementWithoutAttributes
assertions.push(test.assertExists(markupScenariosProp['OrderNS:EmptyElementWithoutAttributes']));
assertions.push(test.assertEqual('', String(markupScenariosProp['OrderNS:EmptyElementWithoutAttributes']),
  'Expected the OrderNS:EmptyElementWithoutAttributes property value to be an empty string'));
// EmptyElementWithAttribute
assertions.push(test.assertExists(markupScenariosProp['OrderNS:EmptyElementWithAttribute']));
assertions.push(test.assertEqual('hello', String(markupScenariosProp['OrderNS:EmptyElementWithAttribute']['@attr']),
  'Expected OrderNS:EmptyElementWithAttribute to have the "@attr" property set to "hello"'));
// NoTextOrAttrs
assertions.push(test.assertExists(markupScenariosProp['OrderNS:NoTextOrAttrs']));
assertions.push(test.assertEqual('', String(markupScenariosProp['OrderNS:NoTextOrAttrs']),
  'Expected the OrderNS:NoTextOrAttrs property value to be an empty string'));
// JustText
assertions.push(test.assertExists(markupScenariosProp['OrderNS:JustText']));
assertions.push(test.assertEqual('Hello', String(markupScenariosProp['OrderNS:JustText']),
  'Expected the OrderNS:JustText property value to be "Hello"'));
// JustAttr
assertions.push(test.assertExists(markupScenariosProp['OrderNS:JustAttr']));
assertions.push(test.assertEqual('Howdy', String(markupScenariosProp['OrderNS:JustAttr']['@attr']),
  'Expected OrderNS:JustAttr to have the "@attr" property set to "Howdy"'));
// AttrAndText
assertions.push(test.assertExists(markupScenariosProp['OrderNS:AttrAndText']));
assertions.push(test.assertEqual('Some Text', String(markupScenariosProp['OrderNS:AttrAndText']['#text']),
  'Expected OrderNS:AttrAndText to have text of "Some Text"'));
assertions.push(test.assertEqual('myattr', String(markupScenariosProp['OrderNS:AttrAndText']['@attr']),
  'Expected OrderNS:AttrAndText to have the "@attr" property set to "myattr"'));
// AttrTextAndChild
assertions.push(test.assertExists(markupScenariosProp['OrderNS:AttrTextAndChild']));
assertions.push(test.assertEqual('How aredoing?', String(markupScenariosProp['OrderNS:AttrTextAndChild']['#text']),
  'Expected OrderNS:AttrTextAndChild to have text of "How aredoing?"'));
assertions.push(test.assertEqual('woohoo!', String(markupScenariosProp['OrderNS:AttrTextAndChild']['@attr']),
  'Expected OrderNS:AttrTextAndChild to have the "@attr" property set to "woohoo!"'));
assertions.push(test.assertEqual('you', String(markupScenariosProp['OrderNS:AttrTextAndChild']['OrderNS:b']),
  'Expected OrderNS:AttrTextAndChild to have a property named "b" with a value of "you"'));
// MultipleTextNodes
assertions.push(test.assertExists(markupScenariosProp['OrderNS:MultipleTextNodes']));
assertions.push(test.assertEqual('1st text node2nd text node', String(markupScenariosProp['OrderNS:MultipleTextNodes']['#text']),
  'While not desired, expected the two text nodes in OrderNS:MultipleTextNodes to be concatenated'));
// ExampleWithCDATA
assertions.push(test.assertExists(markupScenariosProp['OrderNS:ExampleWithCDATA']));
assertions.push(test.assertEqual('Text outside Text inside More text outside', String(markupScenariosProp['OrderNS:ExampleWithCDATA']),
  'Expected text nodes to be concatenated with CDATA content.'));
// Verify the namespace map is correct.
assertions.push(test.assertEqualJson(expectedNamespaces, result.namespaces, 'The namespaces do not match; expected ' +
  JSON.stringify(expectedNamespaces) + ' but got ' + JSON.stringify(result.namespaces)));
// And finally the format test.
assertions.push(test.assertEqual('XML', String(result.format)));

/*
 * BEGIN: source property tests
 */
const sourceProperties = result.sourceProperties;

// First source property.
let xpath = '/OrderNS:Order';
let prop = sourceProperties[0];
assertions.push(test.assertEqual(xpath.substr(1), prop.name, "Unexpected name for the first source property"));
assertions.push(test.assertEqual(xpath, prop.xpath, "Unexpected xpath for the first source property"));
assertions.push(test.assertTrue(prop.struct, `Expected true for the first source property's struct property but got "${prop.struct}"`));
assertions.push(test.assertEqual(0, prop.level, 'Unexpected level for the first source property'));

// Test struct=false and level=1
xpath = '/OrderNS:Order/OrderNS:RequiredDate';
prop = utils.getSourcePropertyByXPath(sourceProperties, xpath);
assertions.push(test.assertFalse(prop.struct, `Unexpected struct for the ${xpath} source property`));
assertions.push(test.assertEqual(1, prop.level, `Unexpected level for the ${xpath} source property`));

// Namespace changed
xpath = '/OrderNS:Order/OD:OrderDetails';
prop = utils.getSourcePropertyByXPath(sourceProperties, xpath);
assertions.push(test.assertExists(prop, `Expected to find a source property where xpath=${xpath} but did not`));

// Attribute without namespace prefix.
let name = '@in';
let props = utils.getSourcePropertiesByName(sourceProperties, name);
assertions.push(test.assertTrue(props.length === 1, `Expected 1 source property where name=${name} but found ${props.length}`));
assertions.push(test.assertEqual(`/OrderNS:Order/OD:OrderDetails/${name}`, props[0].xpath, `Unexpected xpath property value for the "${name}" source property`));
assertions.push(test.assertFalse(props[0].struct, `Unexpected struct for the "${name}" source property`));
assertions.push(test.assertEqual(2, props[0].level, `Unexpected level for the "${name}" source property`));

// Attribute with namespace prefix.
xpath = '/OrderNS:Order/OD:OrderDetails/@OtherNS:out';
prop = utils.getSourcePropertyByXPath(sourceProperties, xpath);
assertions.push(test.assertExists(prop, `Expected to find a source property where xpath=${xpath} but did not`));

// Array (struct=true)
xpath = '/OrderNS:Order/OD:OrderDetails/OD:OrderDetail';
prop = utils.getSourcePropertyByXPath(sourceProperties, xpath);
assertions.push(test.assertExists(prop, `Expected to find a source property where xpath=${xpath} but did not`));
assertions.push(test.assertTrue(prop.struct, `Unexpected struct for the "${xpath}" source property`));

// Level 3
xpath = '/OrderNS:Order/OrderNS:MarkupScenarios/OrderNS:AttrTextAndChild/OrderNS:b';
prop = utils.getSourcePropertyByXPath(sourceProperties, xpath);
assertions.push(test.assertExists(prop, `Expected to find a source property where xpath=${xpath} but did not`));
assertions.push(test.assertEqual(3, prop.level, `Unexpected level for the "${xpath}" source property`));

// Verify there are the correct number of properties where name=@attr but that they each have a unique xpath.
let expectedCount = 4;
let uniqueXPaths = [];
name = '@attr';
props = utils.getSourcePropertiesByName(sourceProperties, name);
for (let p of props) {
  if (!uniqueXPaths.some(val => val === p.xpath)) {
    uniqueXPaths.push(p.xpath);
  }
}
assertions.push(test.assertEqual(expectedCount, props.length,
  `Expected ${expectedCount} source properties where name=${name} but found ${props.length}`))
assertions.push(test.assertEqual(expectedCount, uniqueXPaths.length,
  `Expected ${expectedCount} unique XPaths on source properties where name=${name} but found ${uniqueXPaths.length}`))

// Verify #text data properties didn't also become source properties.
const textNodes = utils.getSourcePropertiesByName(sourceProperties, xmlToJson.PROP_NAME_FOR_TEXT);
assertions.push(test.assertTrue(textNodes.length === 0,
  `sourceProperties not expected to include "name" properties with a value of "${xmlToJson.PROP_NAME_FOR_TEXT}" yet ${textNodes.length} were found`));
/*
 * END: source property tests
 */

assertions;
