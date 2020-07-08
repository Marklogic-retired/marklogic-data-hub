const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const match = require('/data-hub/5/builtins/steps/mastering/default/matching.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];
const content = datahub.hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/Cust5-merge.json'), {}, xdmp.databaseName(xdmp.database()));
const results = fn.head(match.main(content, { stepId: 'matchCustomers-matching'})).value;

assertions.push(
    test.assertTrue(fn.exists(results), `A matchSummary should be returned. Results: ${results}`),
    test.assertTrue(fn.exists(xdmp.toJSON(results).xpath('matchSummary/actionDetails/*[action = "merge"]')), `A merge action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
)

assertions;