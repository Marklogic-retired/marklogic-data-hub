const mlSmNotificationsRest = require("/marklogic.rest.resource/mlSmNotifications/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const results = fn.head(mlSmNotificationsRest.get({}, {})).toObject();
assertions.push(
  test.assertEqual(2, results.total, xdmp.describe(results)),
  test.assertEqual(2, results.notifications.length)
);

results["notifications"].forEach(notification => {
  assertions.push(test.assertEqual("Test, Test", notification["meta"]["label"]));
})

assertions;


