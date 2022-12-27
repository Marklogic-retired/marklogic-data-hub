const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const hubUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/hub-utils.mjs");
const match = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mastering/default/matching.mjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(content, results) {
    let resultsNode = xdmp.toJSON(results);
    let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
    let customAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "custom"]');
    let notifyAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "notify"]');
    let assertions = [
        test.assertEqual(1, fn.count(results), `A matchSummary should be returned. Results: ${results}`),
        test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(1, fn.count(customAction), `A custom action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(1, fn.count(notifyAction), `A notify action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
    ];
    let mergeURI = fn.string(fn.nodeName(mergeAction));
    let mergeActionObject = fn.head(mergeAction).toObject();
    let customActionObject = fn.head(customAction).toObject();
    let notifyActionObject = fn.head(notifyAction).toObject();
    let customURI = fn.string(fn.nodeName(customAction));
    let customActionMatchResults = customActionObject.matchResults[0];
    return assertions.concat([
        test.assertEqual(3, mergeActionObject.uris.length, `merge action should be only on 3 URIs. Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustMatchMerge1\./.test(uri)), `merge action should have URI matching "CustMatchMerge1.". Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustMatchMerge2\./.test(uri)), `merge action should have URI matching "CustMatchMerge2.". Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertEqual(2, notifyActionObject.uris.length, `notify action should be only on 2 URIs. Results: ${JSON.stringify(notifyActionObject)}`),
        test.assertTrue(notifyActionObject.uris.some((uri) => uri === mergeURI), `notify action should have the merge URI . Results: ${JSON.stringify(notifyActionObject)}`),
        test.assertTrue(notifyActionObject.uris.some((uri) => /CustMatchNotify\./.test(uri)), `notify action should have URI matching "CustMatchNotify.". Results: ${JSON.stringify(notifyActionObject)}`),
        test.assertEqual(1, customActionObject.matchResults.length, `custom action should be only on 1 match result for household. Results: ${JSON.stringify(customActionObject)}`),
        test.assertTrue(/CustMatchHousehold\./.test(customActionMatchResults.uri), `custom action should have URI matching "CustMatchHousehold." Action URI ${customURI}. Results: ${JSON.stringify(customActionObject)}`),
        test.assertEqual(8.5, fn.number(customActionMatchResults.score), `custom action match score should be 8.5 (lastName: 2.5 + billingAddress: 5 + shippingAddress: 2 + reduce for household: -1). Results: ${JSON.stringify(customActionMatchResults)}`)
    ]);
}
function testJsonMatches() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustMatchMerge2.json'), {}, xdmp.databaseName(xdmp.database()));
    const results = match.main(content, { stepId: 'matchCustomers-matching'})[0].value;
    return verifyResults(content, results);
}

function testNamespacedXmlMatches() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/NsCustMatchMerge2.xml'), {}, xdmp.databaseName(xdmp.database()));
    const results = match.main(content, { stepId: 'matchNamespacedCustomers-matching'})[0].value;
    return verifyResults(content, results);
}

function verifyNullsDoNotMatch() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustNonMatchNull.json'), {}, xdmp.databaseName(xdmp.database()));
    const results = match.main(content, { stepId: 'matchCustomers-matching'})[0].value;
    let resultsNode = xdmp.toJSON(results);
    let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
    let customAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "customActions"]');
    let notifyAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "notify"]');
    return [
        test.assertEqual(1, fn.count(results), `A matchSummary should be returned. Results: ${results}`),
        test.assertEqual(0, fn.count(mergeAction), `Zero merge actions should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(0, fn.count(customAction), `Zero custom actions should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(0, fn.count(notifyAction), `Zero notify actions should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
    ];
}

function verifyDocumentXPathDoesNotThrowError() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/PartyDocumentXPath1.xml'), {}, xdmp.databaseName(xdmp.database()));
    const results = match.main(content, { stepId: 'matchDocumentXPathOnly-matching'})[0].value;
    let resultsNode = xdmp.toJSON(results);
    let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
    let customAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "customActions"]');
    let notifyAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "notify"]');
    return [
        test.assertEqual(1, fn.count(results), `A matchSummary should be returned. Results: ${results}`),
        test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(0, fn.count(customAction), `Zero custom actions should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`),
        test.assertEqual(0, fn.count(notifyAction), `Zero notify actions should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
    ];
}

assertions
    .concat(testJsonMatches())
    .concat(testNamespacedXmlMatches())
    .concat(verifyNullsDoNotMatch())
    .concat(verifyDocumentXPathDoesNotThrowError());
