const test = require("/test/test-helper.xqy");

const pma = {
  previewMatchingActivity: (stepName, allUris, restrictToUris, sampleSize = 100) => {
    const results = fn.head(xdmp.invoke("/data-hub/data-services/mastering/previewMatchingActivity.mjs", {
      stepName,
      uris: allUris,
      sampleSize,
      restrictToUris,
      nonMatches: false
    }));
    return results;
  }
};

let allUris = [
  "/content/CustMatchMerge1.json",
  "/content/CustMatchMerge2.json",
  "/content/CustShippingCityStateMatch1.json",
  "/content/CustShippingCityStateMatch2.json",
  "/content/CustShippingCityStateMatch3.json",
  "/content/CustShippingCityStateMatch4.json"
];

const results = [];

const verifyPrimaryKeys = function(result) {
  const allURIs = [];
  for (let action of result.actionPreview) {
    for (let uri of action.uris) {
      if (!allURIs.includes(allURIs)) {
        allURIs.push(uri);
        results.push(test.assertEqual(fn.string(cts.doc(uri).toObject().envelope.instance.Customer.customerId) || uri, result.primaryKeys[uri], `Unexpected primary key value! primaryKeys: ${xdmp.toJsonString(result.primaryKeys)}`));
      }
    }
  }
};

let allUrisResults = pma.previewMatchingActivity("matchCustomers", allUris, false);
verifyPrimaryKeys(allUrisResults);
results.push(test.assertEqual(6, allUrisResults.actionPreview.length, `There should be 6 matching pairs. ${xdmp.toJsonString(allUrisResults)}`));

let uris0_1 = [allUris[0] , allUris[1]];
let uris_0_1_Results = pma.previewMatchingActivity("matchCustomers", uris0_1, false);
verifyPrimaryKeys(uris_0_1_Results);
results.push(test.assertEqual(2, uris_0_1_Results.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 0 and 1"));
results.push(test.assertEqual(1, uris_0_1_Results.actionPreview.length, "There should be only one matching pair for match on docs 0 and 1"));

let uris2_3 = [allUris[2] , allUris[3]];
let uris_2_3_Results = pma.previewMatchingActivity("matchCustomers", uris2_3, false);
verifyPrimaryKeys(uris_2_3_Results);
results.push(test.assertEqual(2, uris_2_3_Results.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(4, uris_2_3_Results.actionPreview.length, `There should be 4 matching pairs for match on docs 2 and 3. actionPreview: ${xdmp.toJsonString(uris_2_3_Results.actionPreview)}`));
results.push(test.assertEqual("9.5", uris_2_3_Results.actionPreview[0].score.toString(), "For match with docs 2 and 4, the first score should be 9.5 for the match between 2 and 4"));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[1].score.toString(), "For match with docs 1 and 2, the 2nd score should be 7.5"));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[2].score.toString(), "For match with docs 1 and 4, the last score should be 7.5"));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[2].score.toString(), "For match with docs 1 and 3, the last score should be 7.5"));

let uris_2_3_ResultRestrictedToURIs = pma.previewMatchingActivity("matchCustomers", uris2_3, true);
verifyPrimaryKeys(uris_2_3_ResultRestrictedToURIs);
results.push(test.assertEqual(2, uris_2_3_ResultRestrictedToURIs.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(1, uris_2_3_ResultRestrictedToURIs.actionPreview.length, `There should be 1 matching pair for match on docs 2 and 3 when not including the entire dataset. actionPreview: ${xdmp.toJsonString(uris_2_3_ResultRestrictedToURIs.actionPreview)}`));
results.push(test.assertEqual("7.5", uris_2_3_ResultRestrictedToURIs.actionPreview[0].score.toString(), "For match with docs 2 and 3, the last score should be 7.5"));

let sampleResults = pma.previewMatchingActivity("matchCustomers", [], false, 3);
verifyPrimaryKeys(sampleResults);
results.push(test.assertEqual(3, sampleResults.actionPreview.length, `There should be 3 pairs in the response's URIs array when sampleSize is 3. ${xdmp.toJsonString(sampleResults)}`));

results;
