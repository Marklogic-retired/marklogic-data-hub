const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const DataHubSingleton = mjsProxy.requireMjsModule("/data-hub/5/datahub-singleton.mjs");
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
