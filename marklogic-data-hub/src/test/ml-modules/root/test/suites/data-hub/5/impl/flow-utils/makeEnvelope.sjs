const test = require("/test/test-helper.xqy");

const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowUtils = new FlowUtils();

const results = [];

let content = flowUtils.getInstance(fn.head(xdmp.unquote('<envelope><instance><test>1</test><test>2</test></instance></envelope>')));
let sequence = '<root xmlns=""><xml>1</xml><xml>2</xml></root>';
let headers = xdmp.unquote(sequence);
let triples = [];
let dataFormat = "xml";

let envelope = flowUtils.makeEnvelope(content, headers, triples, dataFormat);

//Verifies DHFPROD-2741
let test1 = test.assertEqual(sequence, xdmp.quote(envelope.xpath('/*:envelope/*:headers/*:root')));

results.push(test1);

results;
