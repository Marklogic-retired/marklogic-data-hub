const contentLib = require('/entities/Person/input/input1/content.sjs');
const test = require('/test/test-helper.xqy');

let assertions = [];

const rawInput = {
  "hello": "world"
};

const content = contentLib.createContent("id123", rawInput);

assertions.push(
  test.assertEqual("Person", content["$type"]),
  test.assertEqual("0.0.1", content["$version"])
);

assertions
