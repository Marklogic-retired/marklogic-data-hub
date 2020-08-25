'use strict';
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");

const assertions = [];

if (xdmp.version().startsWith("9")) {
  console.log("A bug in ML 9 prevents amps from working on exported SJS functions correctly, " +
    "such that job/batch documents cannot be updated unless the user has flow-operator-role or greater");
}
else {
  const flowName = 'customerV1Flow';
  const stepNumber = '1';
  const options = {uris: cts.uris(null, null, cts.collectionQuery('raw-content')).toArray().map((uri) => fn.string(uri))};
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!options.performanceMetrics
  });

  hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
    const content = datahub.flow.findMatchingContent(flowName, stepNumber, options, null);
    datahub.flow.runFlow(flowName, sem.uuidString(), content, options, stepNumber);
  });

  hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
    const matchSummary = fn.head(cts.search(cts.collectionQuery('datahubMasteringMatchSummary-Customer_V1')));
    const mergeActionURIs = matchSummary.xpath('matchSummary/actionDetails/*[action eq "merge"]/uris');
    assertions.push(test.assertEqual(2, fn.count(mergeActionURIs), `Expected there to be 2 URIs to merge in matchSummary. ${xdmp.describe(matchSummary, Sequence.from([]), Sequence.from([]))}`));
    for (const uri of mergeActionURIs) {
      assertions.push(test.assertTrue(options.uris.includes(fn.string(uri)), `Expect URI ${uri} to merge in matchSummary. ${xdmp.describe(matchSummary, Sequence.from([]), Sequence.from([]))}`));
    }
  });
}

assertions;

