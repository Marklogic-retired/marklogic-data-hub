const test = require("/test/test-helper.xqy");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

let assertions = [];

const content = [
  {
    uri:"/customer1.json",
    value:{"hello": "world"},
    context: {}
  },
  {
    uri:"/customer2.json",
    value:{"hello": "world"},
    context: {quality: 1}
  }
];
const dbName = "data-hub-FINAL";

flowUtils.writeContentArray(content, dbName);

assertions.push(
  test.assertEqual(0, xdmp.eval(`cts.quality(cts.doc("/customer1.json"))`),
    "doc without quality specified should have quality 0"),
  test.assertEqual(1, xdmp.eval(`cts.quality(cts.doc("/customer2.json"))`),
    "doc with quality specified should have correct quality")
);

assertions;