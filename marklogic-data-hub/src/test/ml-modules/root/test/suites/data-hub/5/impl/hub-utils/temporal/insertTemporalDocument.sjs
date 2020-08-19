const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance({});
const temporal = require("/MarkLogic/temporal.xqy");
const test = require("/test/test-helper.xqy");

const assertions = [];

const temporalCollections = temporal
  .collections()
  .toArray()
  .reduce((acc, col) => {
    acc[col] = true;
    return acc;
  }, {});
assertions.push(
    test.assertTrue(
        temporalCollections["temporal-test"],
        `Temporal collections (${xdmp.toJsonString(temporalCollections)}) does not include "temporal-test"`
    )
);
const uri = '/test-temporal-doc.json';
try {
    datahub.hubUtils.writeDocuments(
    Sequence.from([{
        uri,
        value: {
        doc: "test",
        },
        context: {
        // including temporal significant collections that will be removed before temporal insert
        collections: ["temporal-test","latest",uri],
        permissions: [],
        metadata: {
            temporalDocURI: "this-should-be-cleaned-before-temporal-insert",
            validStart: "2014-04-03T11:00:00",
            validEnd: "9999-12-31T11:59:59Z",
        }
        },
    }]),
    [
        xdmp.permission("data-hub-common", "read"),
        xdmp.permission("data-hub-common", "update"),
    ],
    []
    );
} catch (e) {
    assertions.push(test.assertFalse(true, `Unexpected expection on insert: ${xdmp.toJsonString(e)}`));
}
datahub.hubUtils.queryLatest(function() {
    assertions.push(
      test.assertTrue(
        cts.exists(cts.documentQuery([uri])),
        `Expected document to be inserted: ${uri}`
      )
    );
});

assertions;