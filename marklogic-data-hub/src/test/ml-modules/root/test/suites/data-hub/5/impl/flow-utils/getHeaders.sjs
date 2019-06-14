const test = require("/test/test-helper.xqy");

const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowUtils = new FlowUtils();

const results = [];

function getHeadersFromXml(xml) {
  return flowUtils.getHeaders(fn.head(xdmp.unquote(xml)));
}

let headers = getHeadersFromXml('<envelope xmlns="http://marklogic.com/entity-services"><headers></headers></envelope>');
results.push(test.assertEqual(null, headers));

headers = getHeadersFromXml('<envelope xmlns="http://marklogic.com/entity-services"><headers><hello>world</hello></headers></envelope>');
results.push(test.assertEqual(
  '<headers xmlns="http://marklogic.com/entity-services"><hello>world</hello></headers>',
  xdmp.quote(headers)
));

headers = flowUtils.getHeaders(xdmp.toJSON({"envelope": {"headers": {}}}));
results.push(test.assertEqual(null, headers));

headers = flowUtils.getHeaders(xdmp.toJSON({"envelope": {"headers": {"hello": "world"}}}));
results.push(test.assertEqual("world", xs.string(headers.hello)));

results;


