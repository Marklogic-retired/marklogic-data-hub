'use strict';

const test = require("/test/test-helper.xqy");
const utils = require('/test/suites/data-hub/5/data-services/lib/mappingService.sjs').DocumentForTestingUtils;

const assertions = [];

const result = utils.invokeService(utils.STEP_NAME, '/content/sampleCustomerDoc.json');
assertions.concat([
  test.assertExists(result.data, 'Top-level "data" property does not exist'),
  test.assertEqual(204, Number(result.data.CustOrders.CustomerID)),
  test.assertEqual('Sparrow', String(result.data.CustOrders.Nicknames.Nickname[1])),
  test.assertEqualJson({}, result.namespaces, 'The "namespaces" property should be an empty object for JSON input.'),
  test.assertEqual('JSON', String(result.format), 'The "format" property should be set to "JSON".')
]);

assertions;
