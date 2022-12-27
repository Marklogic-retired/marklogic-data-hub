const test = require("/test/test-helper.xqy");

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const flowUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/flow-utils.mjs");

const assertions = [];

let output = flowUtils.parseText('{"hello":"world"}', "json");
assertions.push(test.assertEqual("world", output.toObject().hello));

output = flowUtils.parseText('<hello>world</hello>', 'xml');
assertions.push(test.assertEqual("world", output.xpath("/hello/fn:string()")));

assertions
