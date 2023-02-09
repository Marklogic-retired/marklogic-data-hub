const mlSmNotificationsRest = require("/marklogic.rest.resource/mlSmNotifications/assets/resource.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const context = {};

const inputDocument = new NodeBuilder().startDocument();
inputDocument.addNode({name : "lastname"});
inputDocument.endDocument();
const nodeInput = inputDocument.toNode();

const results = fn.head(mlSmNotificationsRest.post(context,  {}, nodeInput)).toObject();

assertions.push(
  test.assertEqual(2, results.total),
  test.assertEqual(2, results.notifications.length)
);

assertions;


