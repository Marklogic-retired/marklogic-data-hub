declareUpdate();

const mlSmNotificationsRest = require("/marklogic.rest.resource/mlSmNotifications/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const emptyDocument = new NodeBuilder().startDocument().endDocument().toNode();
const context = {};
const missingStatusParams = { uris: "/content/notifications2.xml" };

try {
  mlSmNotificationsRest.put(context, missingStatusParams, emptyDocument);
  assertions.push(test.assertTrue(false,"Updating notifications should have failed"));
} catch (e) {
  assertions.push(test.assertEqual("400", e.data[0], xdmp.toJsonString(e)));
  assertions.push(test.assertEqual("status parameter is required", e.data[1], xdmp.toJsonString(e)));
}

const missingUrisParams = { status: "unread" };

try {
  mlSmNotificationsRest.put(context, missingUrisParams, emptyDocument);
  assertions.push(test.assertTrue(false,"Updating notifications should have failed"));
} catch (e) {
  assertions.push(test.assertEqual("400", e.data[0], xdmp.toJsonString(e)));
  assertions.push(test.assertEqual("uris parameter is required", e.data[1], xdmp.toJsonString(e)));
}

const validNotificationsParams = { status: "read", uris: "/content/notification1.xml" };

const validResults = mlSmNotificationsRest.put(context, validNotificationsParams, emptyDocument);

assertions.push(
  test.assertTrue(validResults.success,"Merge should be successful"),
);

const inputDocument = new NodeBuilder().startDocument();
inputDocument.addNode({status : "read", uris: "/content/notification2.xml"});
const nodeInput = inputDocument.endDocument().toNode();

const inputResults = mlSmNotificationsRest.put(context, {} , nodeInput);

assertions.push(
  test.assertTrue(inputResults.success,"Merge should be successful"),
);

assertions;


