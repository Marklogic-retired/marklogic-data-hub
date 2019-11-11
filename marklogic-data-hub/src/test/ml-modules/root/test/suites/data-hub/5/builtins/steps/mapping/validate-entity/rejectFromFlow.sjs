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

  let batchData = fn.head(xdmp.invokeFunction(function () {
    let uri = cts.uris(null, ["limit=1"], cts.collectionQuery("Batch"));
    return {
      "uri" : uri,
      "doc": cts.doc(uri).toObject(),
      "perms": xdmp.documentGetPermissions(uri)
    };
  }, {database: xdmp.database(config.JOBDATABASE)}));

  assertions.push(
    test.assertTrue(batchData.doc.batch.error != null,
      "The error message should have been stored on the Batch document"),
    test.assertTrue(batchData.doc.batch.errorStack != null,
      "The error stacktrace should have been stored on the Batch document")
  );

  // Per DHFPROD-3108, verifying that the new data-hub-job-reader/data-hub-job-internal permissions are set as well
  let jobReaderPerm = batchData.perms.find(perm => xdmp.roleName(perm.roleId) == "data-hub-job-reader");
  assertions.push(test.assertEqual("read", jobReaderPerm.capability));
  let jobInternalPerm = batchData.perms.find(perm => xdmp.roleName(perm.roleId) == "data-hub-job-internal");
  assertions.push(test.assertEqual("update", jobInternalPerm.capability));

  assertions;
}
