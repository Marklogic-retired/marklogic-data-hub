'use strict';

const test = require("/test/test-helper.xqy");
import { DocumentForTestingUtils as utils } from "/test/suites/data-hub/data-services/lib/mappingService.mjs";;

const assertions = [];

const result = utils.invokeService(utils.STEP_NAME1, '/content/envelopedCustomerDoc.xml');
const data = result.data;

const expectedNamespaces = {
  "entity-services":"http://marklogic.com/entity-services",
  "OrderNS":"https://www.w3schools.com/OrderNS"
}

assertions.push(test.assertExists(data, "Top-level 'data' property does not exist"));
assertions.push(test.assertExists(data['OrderNS:Order'], "The data's first property is expected to be 'OrderNS:Order' but was given '" + Object.keys(data).join("' and '") + "'"));
assertions.push(test.assertExists(data['OrderNS:Order']['RequiredDate'], "Expected RequiredDate (no namespace) within OrderNS:Order but found '" + Object.keys(data['OrderNS:Order']).join("' and '") + "'"));
// Make sure this response does not include "":"" (empty string property and value pair due to xmlns="").
assertions.push(test.assertEqualJson(expectedNamespaces, result.namespaces, 'The namespaces do not match; expected ' +
  JSON.stringify(expectedNamespaces) + ' but got ' + JSON.stringify(result.namespaces)));

assertions;
