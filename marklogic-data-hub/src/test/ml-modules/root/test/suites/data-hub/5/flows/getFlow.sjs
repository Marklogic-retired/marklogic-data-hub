const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

const assertions = [];

const flow = datahub.flow.getFlow("myNewFlow");
assertions.push(test.assertEqual("myNewFlow", flow.name));

const flow2 = datahub.flow.getFlow("myNewFlow");
assertions.push(
  test.assertEqual("myNewFlow", flow2.name),
  test.assertTrue(flow === flow2, "flow and flow2 should be the same objects, which verifies that the caching in getFlow works correctly")
);

const nullFlow = datahub.flow.getFlow("myNullFlow");
assertions.push(
  test.assertEqual("myNullFlow", nullFlow.name),
  test.assertFalse(flow === nullFlow)
);

assertions;
