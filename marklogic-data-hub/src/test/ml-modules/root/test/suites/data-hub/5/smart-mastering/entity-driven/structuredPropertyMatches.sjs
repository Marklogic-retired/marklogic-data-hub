const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const match = require('/data-hub/5/builtins/steps/mastering/default/matching.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifySingleValueResults(content, results) {
    let resultsNode = xdmp.toJSON(results);
    let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
    let assertions = [
        test.assertEqual(1, fn.count(results), `A matchSummary should be returned. Results: ${results}`),
        test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. Results: ${xdmp.toJsonString(results)}`)
    ];
    let mergeActionObject = fn.head(mergeAction).toObject();
    return assertions.concat([
        test.assertEqual(2, mergeActionObject.uris.length, `merge action should be only on 2 URIs. Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustBillingCityStateMatch1\./.test(uri)), `merge action should have URI matching "CustBillingCityStateMatch1.". Results: ${JSON.stringify(mergeActionObject)}`),
        test.assertTrue(mergeActionObject.uris.some((uri) => /CustBillingCityStateMatch2\./.test(uri)), `merge action should have URI matching "CustBillingCityStateMatch2.". Results: ${JSON.stringify(mergeActionObject)}`)
    ]);
}
function testSingleValueJsonMatches() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustBillingCityStateMatch2.json'), {}, xdmp.databaseName(xdmp.database()));
    const results = fn.head(match.main(content, { stepId: 'matchCustomerBillingCityState-matching'})).value;
    return verifySingleValueResults(content, results);
}

function testSingleValueNamespacedXmlMatches() {
    const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustBillingCityStateMatch2.xml'), {}, xdmp.databaseName(xdmp.database()));
    const results = fn.head(match.main(content, { stepId: 'matchNSCustomerBillingCityState-matching'})).value;
    return [] // verifySingleValueResults(content, results);
}

function verifySingleValueArrayResults(content, results) {
  let resultsNode = xdmp.toJSON(results);
  let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
  let assertions = [
    test.assertEqual(1, fn.count(results), `A matchSummary should be returned. (verifySingleValueArrayResults) Results: ${results}`),
    test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. (verifySingleValueArrayResults) Results: ${xdmp.toJsonString(results)}`)
  ];
  let mergeActionObject = fn.head(mergeAction).toObject();
  return assertions.concat([
    test.assertEqual(2, mergeActionObject.uris.length, `merge action should be only on 2 URIs. (verifySingleValueArrayResults)
      SingleValueArray tests where the shipping address array has a single Address in the matching documents, but two addresses in the no-match
      document, one with the matching city and one with the matching state.
      Results: ${JSON.stringify(mergeActionObject)}`),
    test.assertTrue(mergeActionObject.uris.some((uri) => /CustShippingCityStateMatch1\./.test(uri)), `merge action should have URI matching "CustShippingCityStateMatch1.". Results: ${JSON.stringify(mergeActionObject)}`),
    test.assertTrue(mergeActionObject.uris.some((uri) => /CustShippingCityStateMatch2\./.test(uri)), `merge action should have URI matching "CustShippingCityStateMatch2.". Results: ${JSON.stringify(mergeActionObject)}`)
  ]);
}
function testSingleValueArrayJsonMatches() {
  const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustShippingCityStateMatch2.json'), {}, xdmp.databaseName(xdmp.database()));
  const results = fn.head(match.main(content, { stepId: 'matchCustomerShippingCityState-matching'})).value;
  return verifySingleValueArrayResults(content, results);
}

function testSingleValueArrayNamespacedXmlMatches() {
  const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/NsCustShippingCityStateMatch2.xml'), {}, xdmp.databaseName(xdmp.database()));
  const results = fn.head(match.main(content, { stepId: 'matchNSCustomerShippingCityState-matching'})).value;
  return verifySingleValueArrayResults(content, results);
}

function verifyMultiValueArrayResults(content, results) {
  let resultsNode = xdmp.toJSON(results);
  let mergeAction = resultsNode.xpath('matchSummary/actionDetails/*[action = "merge"]');
  let assertions = [
    test.assertEqual(1, fn.count(results), `A matchSummary should be returned. (verifyMultiValueArrayResults) Results: ${results}`),
    test.assertEqual(1, fn.count(mergeAction), `A merge action should be in the matchSummary. (verifyMultiValueArrayResults) Results: ${xdmp.toJsonString(results)}`)
  ];
  let mergeActionObject = fn.head(mergeAction).toObject();
  return assertions.concat([
    test.assertEqual(2, mergeActionObject.uris.length, `merge action should be only on 2 URIs. (verifyMultiValueArrayResults)
      MultiValueArray tests where the shipping address arrays have multiple addresses in the matching documents,
      one of which matches between the two documents. The no-match document has the cities and states from the match documents,
      but in combinations that should not match.
      Results: ${JSON.stringify(mergeActionObject)}`),
    test.assertTrue(mergeActionObject.uris.some((uri) => /CustShippingCityStateMatch3\./.test(uri)), `merge action should have URI matching "CustShippingCityStateMatch3.". Results: ${JSON.stringify(mergeActionObject)}`),
    test.assertTrue(mergeActionObject.uris.some((uri) => /CustShippingCityStateMatch4\./.test(uri)), `merge action should have URI matching "CustShippingCityStateMatch4.". Results: ${JSON.stringify(mergeActionObject)}`)
  ]);
}
function testMultiValueArrayJsonMatches() {
  const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/CustShippingCityStateMatch4.json'), {}, xdmp.databaseName(xdmp.database()));
  const results = fn.head(match.main(content, { stepId: 'matchCustomerShippingCityState-matching'})).value;
  return verifyMultiValueArrayResults(content, results);
}

function testMultiValueArrayNamespacedXmlMatches() {
  const content = hubUtils.queryToContentDescriptorArray(cts.documentQuery('/content/NsCustShippingCityStateMatch2.xml'), {}, xdmp.databaseName(xdmp.database()));
  const results = fn.head(match.main(content, { stepId: 'matchNamespacedCustomers-matching'})).value;
  return [] //verifyMultiValueArrayResults(content, results);
}

assertions
    .concat(testSingleValueJsonMatches())
    //.concat(testSingleValueNamespacedXmlMatches())
    .concat(testSingleValueArrayJsonMatches())
    //.concat(testSingleValueArrayNamespacedXmlMatches())
    .concat(testMultiValueArrayJsonMatches())
    //.concat(testMultiValueArrayNamespacedXmlMatches())
    ;

