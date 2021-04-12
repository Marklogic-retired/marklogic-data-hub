const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const test = require("/test/test-helper.xqy");

// Ignoring context, since that's tested in copyJsonObjectValue.sjs
const content = {
  "uri": "my-uri",
  "value": xdmp.toJSON({"hello":"world"})
};

const copy = flowRunner.copyContentObject(content);

// Modify the original content; in this scenario, we know that a shallow copy of content.value is safe because a JSON 
// node cannot be modified; a user must first call toObject on it
content.uri = "modified-uri";
const objectValue = content.value.toObject();
objectValue.hello = "modified";
content.value = objectValue;

const assertions = [
  test.assertEqual("my-uri", copy.uri),
  test.assertEqual("world", copy.value.toObject().hello)
];

assertions
