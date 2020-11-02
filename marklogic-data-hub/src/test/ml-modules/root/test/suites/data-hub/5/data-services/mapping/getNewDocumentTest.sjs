const test = require("/test/test-helper.xqy");
const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const dataHub = DataHubSingleton.instance();
const hubTest = require("/test/data-hub-test-helper.sjs");

const jsonUri = '/test/sampleCustomerDoc.json';
const jsonInput = {
  envelope:{
    instance:{
      CustOrders:{
        CustomerID:204,
        Name:{
          FirstName: 'Jacqueline',
          LastName: 'Knowles'
        },
        Nicknames:{
          Nickname:[
            'Jack',
            'Sparrow'
          ]
        }
      }
    }
  }
};

const xmlUri = '/test/sampleCustomerDoc.xml';
const xmlInput = `
<Order xmlns="https://www.w3schools.com/OrderNS">
  <RequiredDate>1996-09-23T13:27:06</RequiredDate>
  <ShipName>B's Beverages</ShipName>
  <OrderDetails xmlns="https://www.w3schools.com/OD" xmlns:OD="https://www.w3schools.com/OD"
        xmlns:OtherNS="https://www.w3schools.com/OtherNS"
        in="this attr should be 'in' in the output"
        OD:in2="this attr should be 'in2' in the output"
        OtherNS:out="this attr should be '@OtherNS:out' in the output">
    <OrderDetail xmlns:Wash="https://www.w3schools.com/Washington">
      <Wash:UnitPrice xmlns:Omega="Omega">26.6000</Wash:UnitPrice>
      <Wash:Discount>0</Wash:Discount>
      <Wash:Quantity>9</Wash:Quantity>
      <Wash:ProductID>64</Wash:ProductID>
    </OrderDetail>
    <OrderDetail xmlns:Cali="https://www.w3schools.com/California">
      <Cali:UnitPrice>27.2000</Cali:UnitPrice>
      <Cali:Discount>0</Cali:Discount>
      <Cali:Quantity>40</Cali:Quantity>
      <Cali:ProductID xmlns:Product="https://www.w3schools.com/ProductNS">60</Cali:ProductID>
    </OrderDetail>
  </OrderDetails>
  <ShippedDate xmlns:SD="https://www.w3schools.com/SD1">1996-08-28T19:15:26</ShippedDate>
  <ShippedDate xmlns:SD="https://www.w3schools.com/SD2">1997-02-13T120:15:26</ShippedDate>
  <ShipCity>London</ShipCity>
  <CustomerID>BSBEV</CustomerID>
  <ShipVia xmlns="https://www.w3schools.com/SV">3</ShipVia>
  <ShipPostalCode>EC2 5NT</ShipPostalCode>
  <OrderID>10289</OrderID>
  <OrderDate>1996-08-26T07:24:10</OrderDate>
  <ShipRegion>null</ShipRegion>
  <ShipAddress>Fauntleroy Circus</ShipAddress>
  <ShipCountry>UK</ShipCountry>
  <EmployeeID>7</EmployeeID>
  <Freight>22.7700</Freight>
  <Element1 xmlns="https://www.microsoft.com/Gamma">Should *not* be in an array.</Element1>
  <Element1 xmlns="https://www.amazon.com/Gamma">Should *not* be in an array.</Element1>
  <Element2>Should be in an array.</Element2>
  <Element2>Should be in an array.</Element2>
  <MarkupScenarios>
    <EmptyElementWithoutAttributes/>
    <EmptyElementWithAttribute attr="hello"/>
    <NoTextOrAttrs></NoTextOrAttrs>
    <JustText>Hello</JustText>
    <JustAttr attr="Howdy"></JustAttr>
    <AttrAndText attr="myattr">Some Text</AttrAndText>
    <AttrTextAndChild attr="whohoo!">How are <b>you</b> doing?</AttrTextAndChild>
    <MultipleTextNodes>1st text node<subscript>1</subscript>2nd text node<superscript>2</superscript></MultipleTextNodes>
    <ExampleWithCDATA>Text outside <![CDATA[Text inside]]> More text outside</ExampleWithCDATA>
  </MarkupScenarios>
</Order>`;

function invokeService(stepName, uri) {
  return fn.head(hubTest.runWithRolesAndPrivileges(['hub-central-mapping-reader'], [],
    "/data-hub/5/data-services/mapping/getNewDocument.sjs", {stepName, uri}
  ));
}

function loadTestData() {
  const perms = [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-operator", "read"), xdmp.permission("data-hub-operator", "update")];
  dataHub.hubUtils.writeDocument(jsonUri, jsonInput, perms, ['Customer'], dataHub.config.FINALDATABASE);
  dataHub.hubUtils.writeDocument(xmlUri, fn.head(xdmp.unquote(xmlInput)), perms, ['Customer'], dataHub.config.FINALDATABASE);
}

function testJsonInput() {
  const result = invokeService('someStepName', jsonUri);
  return [
    test.assertExists(result.data, 'Top-level "data" property does not exist'),
    test.assertEqual(204, Number(result.data.CustOrders.CustomerID)),
    test.assertEqual('Sparrow', String(result.data.CustOrders.Nicknames.Nickname[1])),
    test.assertEqualJson({}, result.namespaces, 'The "namespaces" property should be an empty object for JSON input.'),
    test.assertEqual('JSON', String(result.format), 'The "format" property should be set to "JSON".')
  ];
}

function testXmlInput() {
  const result = invokeService('someStepName', xmlUri);
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

  const orderProp = result.data['OrderNS:Order'];
  let markupScenariosProp;
  if (orderProp) {
    markupScenariosProp = orderProp['OrderNS:MarkupScenarios'];
  }
  return [
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
  ];
}

[]
  .concat(loadTestData())
  .concat(testJsonInput())
  .concat(testXmlInput())
  // No need to delete test data.
