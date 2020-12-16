const main = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
const test = require("/test/test-helper.xqy");

const entityInfo = {
  "title": "testEntity",
  "version": "0.0.1",
  "baseUri": "http://example.org/"
};

const docXML = fn.head(xdmp.unquote(`<envelope xmlns="http://marklogic.com/entity-services">
  <headers>
    <sources xmlns="">
        <name>SomeSource</name>
    </sources>
    <createdOn xmlns="">2019-05-31T23:34:42.527238-07:00</createdOn>
    <createdBy xmlns="">ingest-user</createdBy>
  </headers>
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
      "createdBy": "ingest-user"
    },
    "instance": {
      "hello": "world"
    },
    "attachments": null
  }
});


const jsonInstance = xdmp.toJSON({
  "testEntity": {
    "hello": "world"
  }
});

const xmlInstance = xdmp.unquote(`<testEntity>
      <hello>world</hello>
    </testEntity>`)

const options = {};
const currentUser = `${xdmp.getCurrentUser()}`;

function testXMLResults(assertions, docToTest) {
  try {
    assertions.push(
      test.assertEqual("SomeSource", fn.string(docToTest.xpath('/*:envelope/*:headers/*:sources/*:name')),
        "The 'sources' header in the incoming document should be retained by the mapping function"),
      test.assertEqual(currentUser, fn.string(docToTest.xpath('/*:envelope/*:headers/*:createdBy')),
        "The 'createdBy' header in the incoming document should be the user that ran the step and not 'ingest-user'(which is non existent) "),
      test.assertNotEqual("2019-05-31T23:34:42.527238-07:00", fn.string(docToTest.xpath('/*:envelope/*:headers/*:createdOn')),
        "The 'createdOn' header in the incoming document should have the same value as ingested document.")
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
    let headers = docToTest.envelope.headers;
    let sources = headers.sources[0] ? headers.sources[0] : headers.sources;
    assertions.push(
      test.assertEqual("SomeSource", sources.name,
        "The 'sources' header in the incoming document should be retained by the mapping function"),
      test.assertEqual(currentUser, headers.createdBy,
        "The 'createdBy' header in the incoming document should be the user that ran the step and not 'ingest-user'(which is non existent) "),
      test.assertNotEqual("2019-05-31T23:34:42.527238-07:00", headers.createdOn,
        "The 'createdOn' header in the incoming document should not have the same value as ingested document.")

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

const resultXMLtoXML = main.buildEnvelope(entityInfo, docXML, xmlInstance, "xml", options);
const resultJSONtoXML = main.buildEnvelope(entityInfo, docJSON, xmlInstance, "xml", options);
const resultXMLtoJSON = main.buildEnvelope(entityInfo, docXML, jsonInstance, "json", options).toObject();
const resultJSONtoJSON = main.buildEnvelope(entityInfo, docJSON, jsonInstance, "json", options).toObject();

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
