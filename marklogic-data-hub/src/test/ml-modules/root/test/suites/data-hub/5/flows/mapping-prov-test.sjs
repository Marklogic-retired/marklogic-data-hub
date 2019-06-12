const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function fineProvOnMapping() {
  datahub.flow.runFlow('CustomerMapping', 'prov-test-job', [
    {
      uri: '/customer1.json',
      value: cts.doc('/customer1.json'),
      context: {}
    }
  ], { provenanceGranularityLevel: 'fine'}, 1);
  let provCount = fn.head(
    xdmp.invokeFunction(function() {
      return cts.estimate(cts.collectionQuery([
        'http://marklogic.com/provenance-services/record'
      ]));
    }, { database: xdmp.database('data-hub-JOBS')})
  );
  return [
    test.assertTrue(provCount > 1, `Provenance document count should be greater than 1 (was: ${provCount})`)
  ];
}

[]
  .concat(fineProvOnMapping());
