const test = require("/test/test-helper.xqy");

const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowUtils = new FlowUtils();

const assertions = [];

let output = flowUtils.parseText('{"hello":"world"}', "json");
assertions.push(test.assertEqual("world", output.toObject().hello));

output = flowUtils.parseText('<hello>world</hello>', 'xml');
assertions.push(test.assertEqual("world", output.xpath("/hello/fn:string()")));

assertions
