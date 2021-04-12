const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const test = require("/test/test-helper.xqy");

const content = {
  "uri": "my-uri",
  "value": {"hello":"world"},
  "context": {
    "collections": ["coll1", "coll2"],
    "originalCollections": ["orig1", "orig2"],
    "permissions": [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-common-writer", "update")],
    "metadata": {
      "meta1": "value1",
      "meta2": "value2"
    },
    "somethingElse": {
      "child": "value"
    }
  },
  "anotherThing": {
    "child": "value"
  }
};

const copy = flowRunner.copyContentObject(content);

// Now modify the original content and make sure the copy isn't modified - except for ".value"
content.uri = "modified-uri";
content.value.hello = "modified";
content.context.collections = ["modified"];
content.context.originalCollections = ["also-modified"];
content.context.permissions = [xdmp.permission("rest-reader", "read"), xdmp.permission("rest-writer", "update")];
content.context.metadata.meta1 = "modified1";
content.context.metadata.meta2 = "modified2";
content.context.somethingElse.child = "modified";
content.anotherThing.child = "modified";

const assertions = [
  test.assertEqual("my-uri", copy.uri),
  test.assertEqual("modified", copy.value.hello, "It's expected that value is modified because copyContentObject is doing a shallow copy; " + 
    "see the comments on this function for why a deep copy is not yet being done"
  ),
  test.assertEqual(2, copy.context.collections.length),
  test.assertEqual("coll1", copy.context.collections[0]),
  test.assertEqual("coll2", copy.context.collections[1]),
  test.assertEqual(2, copy.context.originalCollections.length),
  test.assertEqual("orig1", copy.context.originalCollections[0]),
  test.assertEqual("orig2", copy.context.originalCollections[1]),
  test.assertEqual("data-hub-common", xdmp.roleName(copy.context.permissions[0].roleId)),
  test.assertEqual("data-hub-common-writer", xdmp.roleName(copy.context.permissions[1].roleId)),
  test.assertEqual("value1", copy.context.metadata.meta1),
  test.assertEqual("value2", copy.context.metadata.meta2),
  test.assertEqual("modified", copy.context.somethingElse.child, "Any unknown property has the same issues as content.value, " + 
    "where it's not known if a deep copy can be reliably performed. So a shallow copy is expected."),
  test.assertEqual("modified", copy.anotherThing.child, "Any unknown property has the same issues as content.value, " + 
    "where it's not known if a deep copy can be reliably performed. So a shallow copy is expected.")
];

assertions
