const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function flowWorksWithValues() {
    return fn.head(hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function() {
        const assertions = [];

        const flowName = "CustomerByValue";
        const options = {
            sourceQueryIsScript: true,
            provenanceGranularityLevel: 'off',
            uris: "test-data"
        };

        const content = datahub.flow.findMatchingContent(flowName, "1", options, null);
        assertions.push(
            test.assertEqual(1, content.length),
            test.assertEqual("test-data", content[0].uri,
                "Each value is stored in a separate content item under the 'uri' property so that we can maintain the convention " +
                "that every content item has a 'uri' property.")
        );

        const response = datahub.flow.runFlow(flowName, 'value-test-job', content, options, 1);
        return assertions.concat(
            test.assertEqual(0, response.errors.length),
            test.assertEqual(1, response.totalCount),
            test.assertEqual("test-data", response.completedItems[0])
        );
    }));
}

const assertions = [];

if (xdmp.version().startsWith("9")) {
  console.log("A bug in ML 9 prevents amps from working on exported SJS functions correctly, " +
    "such that job/batch documents cannot be updated unless the user has flow-operator-role or greater");
  assertions;
} else {
  assertions.concat(flowWorksWithValues());
}

