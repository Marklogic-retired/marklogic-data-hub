const config = require("/com.marklogic.hub/config.sjs");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const lib = require("lib/lib.sjs");
const test = require("/test/test-helper.xqy");

const datahub = DataHubSingleton.instance();

if (lib.canTestJsonSchemaValidation() && esMappingLib.versionIsCompatibleWithES()) {
  const content = ["/content/invalid-customer.json", "/content/valid-customer.json"].map(uri => {
    return {
      uri: uri,
      value: cts.doc(uri)
    };
  });

  let results = datahub.flow.runFlow('CustomerMapping', 'test-job', content, {provenanceGranularityLevel: 'off'}, 1);

  let assertions = [
    test.assertEqual(2, results.totalCount),
    test.assertEqual(1, results.errorCount,
      "The invalid customer should have failed since validateEntity == 'reject'"
    )
  ];

  let batch = fn.head(xdmp.invokeFunction(function () {
    return fn.collection("Batch").toArray()[0];
  }, {database: xdmp.database(config.JOBDATABASE)})).toObject();

  assertions.push(
    test.assertTrue(batch.batch.error != null,
      "The error message should have been stored on the Batch document"),
    test.assertTrue(batch.batch.errorStack != null,
      "The error stacktrace should have been stored on the Batch document")
  );

  assertions;
}
