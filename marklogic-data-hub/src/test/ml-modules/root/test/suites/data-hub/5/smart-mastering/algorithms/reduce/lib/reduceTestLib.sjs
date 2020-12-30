const test = require("/test/test-helper.xqy");

function verifyReduceMatchSummary(matchSummary) {
  const notificationUri = matchSummary.URIsToProcess[1];
  const actionDetails = matchSummary.actionDetails[notificationUri];

  return [
    test.assertEqual("notify", actionDetails.action,
      "The action should be a notify because of the exact match on lastName, which assigns a score of 10, " + 
      "but then the exact match on street reduces the score to 5, thus hitting the Possible Match threshold"
    ),
    test.assertEqual("Possible Match", actionDetails.threshold),
    test.assertTrue(notificationUri.startsWith("/com.marklogic.smart-mastering/matcher/notifications/")),
    test.assertEqual(2, actionDetails.uris.length),
    test.assertEqual("/content/JaneTurnerSameStreet.json", actionDetails.uris[0]),
    test.assertEqual(smTest.TEST_DOC_URI, actionDetails.uris[1])
  ];
}

module.exports = {
  verifyReduceMatchSummary
}