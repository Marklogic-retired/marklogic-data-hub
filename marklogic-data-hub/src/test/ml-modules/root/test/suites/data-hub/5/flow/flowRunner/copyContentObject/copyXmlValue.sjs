const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const test = require("/test/test-helper.xqy");

// Ignoring context, since that's tested in copyJsonObjectValue.sjs
const content = {
  "uri": "my-uri",
  "value": fn.head(xdmp.unquote("<hello>world</hello>"))
};

const copy = flowRunner.copyContentObject(content);

// Modify the original; note that with an XML document node, a shallow copy works fine because 
// there's no way to directly modify a document node
content.uri = "modified-uri";
content.value = fn.head(xdmp.unquote("<modified>true</modified>"));

const assertions = [
  test.assertEqual("my-uri", copy.uri),
  test.assertEqual("world", copy.value.xpath("/hello/fn:string()"))
];

assertions
