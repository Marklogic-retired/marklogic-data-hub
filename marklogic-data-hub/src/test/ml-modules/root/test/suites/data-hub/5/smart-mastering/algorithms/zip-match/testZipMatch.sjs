const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const options = {
  "targetEntityType": "http://example.org/Address-0.0.1/Address",
  "matchRulesets": [
    {
      "name": "zip",
      "weight": 10,
      "matchRules": [
        {
          "entityPropertyPath": "zip",
          "matchType": "zip"
        }
      ]
    }
  ],
  "thresholds": [
    {
      "thresholdName": "match",
      "action": "merge",
      "score": 10
    }
  ]
};

const matchSummary = smTest.match("Address", {"zip": "11111"}, options);
const uriToProcess = matchSummary.URIsToProcess[0];
const actionDetails = matchSummary.actionDetails[uriToProcess];

assertions.push(
  test.assertTrue(uriToProcess.startsWith("/com.marklogic.smart-mastering/merged/"),
    "Because a merge was found, the URI to process should have a URL that indicates a merged document will be written " +
    "when the merging step is run"),

  test.assertEqual("merge", actionDetails.action),

  test.assertEqual(3, actionDetails.uris.length, "We expect 3 docs here; the input doc, the FiveDigit doc because " +
    "it has the same input zip, and the NineDigit doc because it starts with 11111-. " +
    "NoMatch shouldn't match because it has a slightly different 5 char zip code. " +
    "NoNineDigitMatch shouldn't match because while it has 11111 in it, it doesn't start with that. " +
    "Note that in order for NineDigit to match, wildcard searches must be supported by the database. For this test, " +
    "it's expected that three-character-searches and trailing-wildcard-searches are both enabled so that a query on " +
    "'11111-*' will match."),

  test.assertEqual("/content/FiveDigitMatch.json", actionDetails.uris[0]),
  test.assertEqual("/content/NineDigitMatch.json", actionDetails.uris[1],
    "The URIs are expected to be ordered, so Nine should come after Five"),
  test.assertEqual(smTest.TEST_DOC_URI, actionDetails.uris[2])
)

assertions;
