const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

const legacyOptions = {
  "targetEntity": "Address",
  "matchOptions": {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [
        {
          "localname": "city",
          "name": "city"
        },
        {
          "localname": "zip",
          "name": "zip"
        }
      ]
    },
    "algorithms": {
      "algorithm": [
        {
          "name": "zip-match",
          "function": "zip-match",
          "namespace": "http://marklogic.com/smart-mastering/algorithms",
          "at": "/com.marklogic.smart-mastering/algorithms/zip.xqy"
        }
      ]
    },
    "scoring": {
      "add": [
        {
          "propertyName": "city",
          "weight": "5"
        }
      ],
      "expand": [
        {
          "propertyName": "zip",
          "algorithmRef": "zip-match",
          "zip": [
            {
              "origin": 5,
              "weight": "10"
            },
            {
              "origin": 9,
              "weight": "10"
            }
          ]
        }
      ]
    },
    "thresholds": {
      "threshold": [
        {
          "above": "10",
          "label": "Match",
          "action": "merge"
        }
      ]
    }
  }
};

const matchSummary = smTest.match("Address", {"city": "Springfield", "zip": "11111"}, legacyOptions);

const uriToProcess = matchSummary.URIsToProcess[0];
const actionDetails = matchSummary.actionDetails[uriToProcess];

// This has the same assertions as testZipMatch.sjs, so the assertion messages are not included
// Goal is to verify that the equivalent unconverted match options produce the same results
assertions.push(
  test.assertTrue(uriToProcess.startsWith("/com.marklogic.smart-mastering/merged/")),
  test.assertEqual("merge", actionDetails.action),
  test.assertEqual(3, actionDetails.uris.length),
  test.assertEqual("/content/FiveDigitMatch.json", actionDetails.uris[0]),
  test.assertEqual("/content/NineDigitMatch.json", actionDetails.uris[1]),
  test.assertEqual(smTest.TEST_DOC_URI, actionDetails.uris[2])
)

assertions;
