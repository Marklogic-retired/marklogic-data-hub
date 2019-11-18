const config = require("/com.marklogic.hub/config.sjs");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const hubTest = require("/test/data-hub-test-helper.xqy");
const test = require("/test/test-helper.xqy");

const datahub = DataHubSingleton.instance();

if (esMappingLib.versionIsCompatibleWithES()) {
  const content = ["/content/person1.json"].map(uri => {
    return {
      uri: uri,
      value: cts.doc(uri)
    };
  });

  let jobResult = datahub.flow.runFlow('PersonFlow', 'runFlowWithInvalidMappingExpressionJob', content, {provenanceGranularityLevel: 'off'}, 1);
  let batch = hubTest.getFirstBatchDocument().toObject();

  [
    test.assertEqual("/content/person1.json", jobResult.errors[0].uri,
      "The URI of the failed document should be captured in the error object so that it will be available in the Batch document " +
      "that's written for the failed batch."),

    test.assertEqual("/content/person1.json", batch.batch.completeError.uri,
      "The completeError is used to capture everything from the error object that was created by the flow runner, and thus the URI" +
      "of the failed document should be present.")
  ];
}
