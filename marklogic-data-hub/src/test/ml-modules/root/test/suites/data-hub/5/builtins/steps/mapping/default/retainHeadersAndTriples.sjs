const main = require("/data-hub/5/builtins/steps/mapping/default/main.sjs");
const test = require("/test/test-helper.xqy");

const doc = xdmp.toJSON({
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
    "triples": [],
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

// Options don't matter for this test
const options = {};

const result = main.buildEnvelope(doc, fakeInstance, "json", {});

[
  test.assertEqual("SomeSource", result.envelope.headers.sources[0].name,
    "The 'sources' header in the incoming document should be retained by the mapping function")
];
