const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

let artifact = {
  "info": {},
  "definitions": {},
  "language": "zxx"
};
hubUtils.replaceLanguageWithLang(artifact);
assertions.push(
  test.assertEqual("zxx", artifact.lang),
  test.assertTrue(artifact.language === undefined)
);

artifact = {
  "langNotHere": "hello"
};
hubUtils.replaceLanguageWithLang(artifact);
assertions.push(
  test.assertEqual("hello", fn.string(artifact.langNotHere)),
  test.assertEqual(1, Object.keys(artifact).length)
);
assertions;
