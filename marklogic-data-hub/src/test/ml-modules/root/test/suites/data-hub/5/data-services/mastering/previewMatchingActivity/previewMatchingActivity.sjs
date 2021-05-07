const test = require("/test/test-helper.xqy");

const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

let allUris = [
  "/content/CustMatchMerge1.json",
  "/content/CustMatchMerge2.json",
  "/content/CustShippingCityStateMatch1.json",
  "/content/CustShippingCityStateMatch2.json",
  "/content/CustShippingCityStateMatch3.json",
  "/content/CustShippingCityStateMatch4.json"
];

const options = cts.doc("/steps/matching/matchCustomers.step.json").root;
const sourceQuery = xdmp.eval(options.sourceQuery);

let results = [];

let allUrisResults = pma.previewMatchingActivity(options, sourceQuery, allUris, false, 0);
results.push(test.assertEqual(7, allUrisResults.actionPreview.length, "There should be 7 matching pairs"));

let uris0_1 = [allUris[0] , allUris[1]];
let uris_0_1_Results = pma.previewMatchingActivity(options, sourceQuery, uris0_1, false, 0);
results.push(test.assertEqual(2, uris_0_1_Results.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 0 and 1"));
results.push(test.assertEqual(1, uris_0_1_Results.actionPreview.length, "There should be only one matching pair for match on docs 0 and 1"));

let uris2_3 = [allUris[2] , allUris[3]];
let uris_2_3_Results = pma.previewMatchingActivity(options, sourceQuery, uris2_3, false, 0);
results.push(test.assertEqual(2, uris_2_3_Results.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(5, uris_2_3_Results.actionPreview.length, `There should be 5 matching pairs for match on docs 2 and 3. actionPreview: ${xdmp.toJsonString(uris_2_3_Results.actionPreview)}`));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[0].score.toString(), "For match with docs 1 and 2, the first score should be 7.5 for the match between 2 and 3"));
results.push(test.assertEqual("9.5", uris_2_3_Results.actionPreview[1].score.toString(), "For match with docs 1 and 3, the 2nd score should be 9.5"));
results.push(test.assertEqual("7.5", uris_2_3_Results.actionPreview[4].score.toString(), "For match with docs 2 and 3, the last score should be 7.5"));

let uris_2_3_ResultRestrictedToURIs = pma.previewMatchingActivity(options, sourceQuery, uris2_3, true, 0);
results.push(test.assertEqual(2, uris_2_3_ResultRestrictedToURIs.uris.length, "There should be 2 URIs in the response's URIs array for match on docs 2 and 3"));
results.push(test.assertEqual(1, uris_2_3_ResultRestrictedToURIs.actionPreview.length, `There should be 1 matching pair for match on docs 2 and 3 when not including the entire dataset. actionPreview: ${xdmp.toJsonString(uris_2_3_ResultRestrictedToURIs.actionPreview)}`));
results.push(test.assertEqual("7.5", uris_2_3_ResultRestrictedToURIs.actionPreview[0].score.toString(), "For match with docs 2 and 3, the last score should be 7.5"));

let sampleResults = pma.previewMatchingActivity(options, sourceQuery, [], false, 3);
results.push(test.assertEqual(3, sampleResults.uris.length, "There should be 3 URIs in the response's URIs array when sampleSize is 3"));

results;
