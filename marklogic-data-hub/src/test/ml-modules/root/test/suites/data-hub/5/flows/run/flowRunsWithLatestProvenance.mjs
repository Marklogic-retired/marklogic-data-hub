import config from "/com.marklogic.hub/config.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";

const test = require("/test/test-helper.xqy");
const hubTestXqy = require("/test/data-hub-test-helper.xqy");

const datahub = DataHubSingleton.instance();

function flowWorksWithLatestProvenance() {
  return fn.head(hubTest.runWithRolesAndPrivileges(['hub-central-step-runner', 'data-hub-job-internal', 'ps-user'], [], function() {
    const assertions = [];

    const flowName = "CustomerByValue";
    const options = {
      sourceQueryIsScript: true,
      provenanceGranularityLevel: 'coarse',
      latestProvenance: true,
      uris: "test-data",
      writeStepOutput: true
    };

    const content = datahub.flow.findMatchingContent(flowName, "1", options);
    assertions.push(
      test.assertEqual(1, content.length),
      test.assertEqual("test-data", content[0].uri,
        "Each value is stored in a separate content item under the 'uri' property so that we can maintain the convention " +
        "that every content item has a 'uri' property.")
    );

    const response = datahub.flow.runFlow(flowName, 'value-test-job', content, options, 1);
    assertions.push(
      test.assertEqual(0, response.errors.length),
      test.assertEqual(1, response.totalCount),
      test.assertEqual("test-data", response.completedItems[0])
    );
    assertions.push(
      test.assertEqual(1, fn.count(hubTestXqy.getProvDocuments(config.FINALDATABASE)), "There should be one provenance record in FINAL")
    );
    return assertions
  }));
}

flowWorksWithLatestProvenance();
