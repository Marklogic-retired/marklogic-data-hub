const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const ing = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/ingestion/default/main.mjs");

const test = require("/test/test-helper.xqy");
let assertions = [];

function runJsonToXmlIngest() {
  let input = fn.head(xdmp.unquote('<root><name>foo</name></root>'));
  let options = {"outputFormat":"xml"}
  let content = {"uri":"/test/test.xml", "value":input}
  assertions.push(test.assertEqual('<root xmlns=""><name>foo</name></root>', String(ing.main(content,options).value.xpath("*:envelope/*:instance/*:root"))));
}
runJsonToXmlIngest()
assertions
