const test = require("/test/test-helper.xqy");

const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowUtils = new FlowUtils();

const results = [];

function getTriplesFromXml(xml) {
  return flowUtils.getTriples(fn.head(xdmp.unquote(xml)));
}

let triples = getTriplesFromXml('<envelope xmlns="http://marklogic.com/entity-services"><triples></triples></envelope>');
results.push(test.assertEqual(null, triples));

// We don't need real triples inside the "triples" element, just need at least one element to verify that it's returned
triples = getTriplesFromXml('<envelope xmlns="http://marklogic.com/entity-services">' +
  '<triples><test/></triples>' +
  '</envelope>');
results.push(test.assertEqual(
  '<triples xmlns="http://marklogic.com/entity-services"><test/></triples>',
  xdmp.quote(triples)
));

triples = flowUtils.getTriples(xdmp.toJSON({"envelope": {"triples": {}}}));
results.push(test.assertEqual(null, triples));

triples = flowUtils.getTriples(xdmp.toJSON({
  "envelope": {
    "triples": [
      {
        "triple": {
          "subject": "s1",
          "predicate": "p1",
          "object": "o1"
        }
      },
      {
        "triple": {
          "subject": "s2",
          "predicate": "p2",
          "object": "o2"
        }
      }
    ]
  }
})).toArray();

results.push(
  test.assertEqual("s1", xs.string(triples[0].triple.subject)),
  test.assertEqual("p1", xs.string(triples[0].triple.predicate)),
  test.assertEqual("o1", xs.string(triples[0].triple.object)),
  test.assertEqual("s2", xs.string(triples[1].triple.subject)),
  test.assertEqual("p2", xs.string(triples[1].triple.predicate)),
  test.assertEqual("o2", xs.string(triples[1].triple.object))
);

results;


