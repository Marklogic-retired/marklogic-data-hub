'use strict';
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";

const test = require("/test/test-helper.xqy");

const assertions = [];

const flowName = 'customerV1Flow';
const stepNumber = '1';
const options = {uris: cts.uris(null, null, cts.collectionQuery('raw-content')).toArray().map((uri) => fn.string(uri))};
const datahub = DataHubSingleton.instance({
  performanceMetrics: !!options.performanceMetrics
});

hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
  const content = datahub.flow.findMatchingContent(flowName, stepNumber, options);
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

assertions;

