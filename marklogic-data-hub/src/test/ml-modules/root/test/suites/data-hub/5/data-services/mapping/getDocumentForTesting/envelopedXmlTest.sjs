'use strict';

const test = require("/test/test-helper.xqy");
const utils = require('/test/suites/data-hub/5/data-services/lib/mappingService.sjs').DocumentForTestingUtils;

const assertions = [];

const result = utils.invokeService(utils.STEP_NAME, '/content/envelopedCustomerDoc.xml');
const data = result.data;

const expectedNamespaces = {
  "OrderNS":"https://www.w3schools.com/OrderNS"
}

assertions.concat([
  test.assertExists(data, "Top-level 'data' property does not exist"),
  test.assertExists(data['OrderNS:Order'], "The data's first property is expected to be 'OrderNS:Order' but was given '" + Object.keys(data).join("' and '") + "'"),
  test.assertExists(data['OrderNS:Order']['RequiredDate'], "Expected RequiredDate (no namespace) within OrderNS:Order but found '" + Object.keys(data['OrderNS:Order']).join("' and '") + "'"),
  // Make sure this response does not include "":"" (empty string property and value pair due to xmlns="").
  test.assertEqualJson(expectedNamespaces, result.namespaces, 'The namespaces do not match; expected ' +
    JSON.stringify(expectedNamespaces) + ' but got ' + JSON.stringify(result.namespaces)),
]);

assertions;
