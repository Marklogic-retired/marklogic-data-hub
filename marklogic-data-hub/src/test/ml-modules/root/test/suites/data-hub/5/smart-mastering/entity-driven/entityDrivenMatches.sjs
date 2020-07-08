const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const match = require('/data-hub/5/builtins/steps/mastering/default/matching.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(content, results) {
    let resultsNode = xdmp.toJSON(results);
    let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
    let customAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "customActions"]');
    let assertions = [
        test.assertEqual(1, fn.count(results), `A matchSummary should be returned. Results: ${results}`),
        test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(1, fn.count(customAction), `A custom action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
    ];
    let mergeActionObject = fn.head(mergeAction).toObject();
    let customActionObject = fn.head(customAction).toObject();
    return assertions.concat([
        test.assertEqual(2, mergeActionObject.uris.length, `merge action should be only on 2 URIs. Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustMatchMerge1\./.test(uri)), `merge action should have URI matching "CustMatchMerge1.". Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustMatchMerge2\./.test(uri)), `merge action should have URI matching "CustMatchMerge2.". Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertEqual(1, customActionObject.actions[0].matchResults.length, `custom action should be only on 1 match result for household. Results: ${JSON.stringify(customActionObject)}`),
        test.assertTrue(/CustMatchHousehold\./.test(customActionObject.actions[0].matchResults[0].uri), `custom action should have URI matching "CustMatchHousehold.". Results: ${JSON.stringify(customActionObject)}`)
    ]);
}
function testJsonMatches() {
    const content = datahub.hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustMatchMerge2.json'), {}, xdmp.databaseName(xdmp.database()));
    const results = fn.head(match.main(content, { stepId: 'matchCustomers-matching'})).value;
    return verifyResults(content, results);
}

function testNamespacedXmlMatches() {
    const content = datahub.hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/NsCustMatchMerge2.xml'), {}, xdmp.databaseName(xdmp.database()));
    const results = fn.head(match.main(content, { stepId: 'matchNamespacedCustomers-matching'})).value;
    return verifyResults(content, results);
}
assertions
    .concat(testJsonMatches())
    .concat(testNamespacedXmlMatches());