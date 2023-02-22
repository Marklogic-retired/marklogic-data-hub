'use strict';
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";

const test = require("/test/test-helper.xqy");

const assertions = [];

const flowName = 'fuzzyMatchMerge';

hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
  const datahub = DataHubSingleton.instance({});
  const stepNumber = "1";
  const options = {uris: cts.uris(null, null, cts.collectionQuery('raw-content')).toArray().map((uri) => fn.string(uri))};
  const content = datahub.flow.findMatchingContent(flowName, stepNumber, options);
  datahub.flow.runFlow(flowName, sem.uuidString(), content, options, stepNumber);
});

hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
  const datahub = DataHubSingleton.instance({});
  const stepNumber = "2";
  const options = {uris: cts.uris(null, null, cts.collectionQuery('datahubMasteringMatchSummary-http://example.org/Customer-0.0.1/Customer')).toArray().map((uri) => fn.string(uri))};
  const content = datahub.flow.findMatchingContent(flowName, stepNumber, options);
  datahub.flow.runFlow(flowName, sem.uuidString(), content, options, stepNumber);
});

hubTest.runWithRolesAndPrivileges(['hub-central-step-runner'], [], function () {
  declareUpdate();
  assertions.push(test.assertEqual(1, cts.estimate(cts.collectionQuery("sm-Customer-merged"))));
  assertions.push(test.assertEqual(3, cts.estimate(cts.collectionQuery("sm-Customer-archived"))));
  xdmp.collectionDelete("mergeCustomers");
});

assertions;