const main = require("/data-hub/5/builtins/steps/mapping/default/main.sjs");
const test = require("/test/test-helper.xqy");

const docXML = fn.head(xdmp.unquote(`<envelope xmlns="http://marklogic.com/entity-services">
  <headers>
    <sources xmlns="">
        <name>SomeSource</name>
    </sources>
    <createdOn xmlns="">2019-05-31T23:34:42.527238-07:00</createdOn>
    <createdBy xmlns="">admin</createdBy>
  </headers>
  <triples>
      <sem:triple xmlns:sem="http://marklogic.com/semantics">
        <sem:subject>s</sem:subject>
        <sem:predicate>p</sem:predicate>
        <sem:object>o</sem:object>
      </sem:triple>
  </triples>
  <instance>
    <hello xmlns="">world</hello>
  </instance>
  <attachments>
  </attachments>
</envelope>`));
const docJSON = xdmp.toJSON({
  "envelope": {
    "headers": {
      "sources": [
        {
          "name": "SomeSource"
        }
      ],
      "createdOn": "2019-05-31T23:34:42.527238-07:00",
      "createdBy": "admin"
    },
    "triples": [{
      "triple": {
        "subject": "s",
        "predicate": "p",
        "object": "o"
      }
    }],
    "instance": {
      "hello": "world"
    },
    "attachments": null
  }
});

// The contents of the instance that will be wrapped don't matter for this test
const fakeInstance = {
  "SomeEntity": {
    "hello": "world"
  }
};

function testXMLResults(assertions, docToTest) {
  try {
    assertions.push(
      test.assertEqual("SomeSource", fn.string(docToTest.xpath('/*:envelope/*:headers/*:sources/*:name')),
        "The 'sources' header in the incoming document should be retained by the mapping function"),
      test.assertEqual("s", fn.string(docToTest.xpath('/*:envelope/*:triples/*:triple/*:subject')),
        "The 'triples' header in the incoming document should be retained by the mapping function")
    );
  } catch (e) {
    assertions.push(
      test.assertFalse(
        fn.true(),
        `Error "${e.toString()}" encountered testing instance '${xdmp.describe(docToTest, Sequence.from([]), Sequence.from([]))}'`
      )
    );
  }
}

function testJSONResults(assertions, docToTest) {
  try {
    let sources = docToTest.envelope.headers.sources[0] ? docToTest.envelope.headers.sources[0] : docToTest.envelope.headers.sources;
    assertions.push(
      test.assertEqual("SomeSource", sources.name,
      "The 'sources' header in the incoming document should be retained by the mapping function"),
      test.assertEqual("s", docToTest.envelope.triples[0].triple.subject,
        "The 'triples' header in the incoming document should be retained by the mapping function")
    );
  } catch (e) {
    assertions.push(
      test.assertFalse(
        fn.true(),
        `Error "${e.toString()}" encountered testing instance '${xdmp.describe(docToTest, Sequence.from([]), Sequence.from([]))}'`
      )
    );
  }
}
// Options don't matter for this test
const options = {};

const resultJSONtoJSON = main.buildEnvelope(docJSON, fakeInstance, "json", {});
const resultJSONtoXML = main.buildEnvelope(docJSON, fakeInstance, "xml", {});
const resultXMLtoJSON = main.buildEnvelope(docXML, fakeInstance, "json", {});
const resultXMLtoXML = main.buildEnvelope(docXML, fakeInstance, "xml", {});

const assertions = [];
// JSON to JSON
testJSONResults(assertions, resultJSONtoJSON);
// JSON to XML
testXMLResults(assertions, resultJSONtoXML);
// XML to JSON
testJSONResults(assertions, resultXMLtoJSON);
// XML to XML
testXMLResults(assertions, resultXMLtoXML);

assertions;
