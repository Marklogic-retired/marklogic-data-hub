const test = require("/test/test-helper.xqy");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

let assertions = [];
let error;

const content = [
  {
    uri:"/customer1.json",
    value:{"hello": "world"},
    context: {quality: "bad value"}
  }
];
const dbName = "data-hub-FINAL";

try {
  flowUtils.writeContentArray(content, dbName);
}
catch (e) {
  error = e;
}

assertions.push(
  test.assertExists(error, "an error must have been thrown by bad request"),
  test.assertEqual(error.name, "XDMP-INVOPTVAL", "error should be XDMP-INVOPTVAL to denote invalid option value")
);

assertions;