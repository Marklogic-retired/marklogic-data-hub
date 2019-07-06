const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const emptySequence = Sequence.from([]);

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function flowWorksWithNull() {
  let resp = datahub.flow.runFlow('CustomerNull', 'null-test-job', [
    {
      uri: '/customer1.json',
      value: cts.doc('/customer1.json'),
      context: {}
    }
  ], { provenanceGranularityLevel: 'off'}, 1);
  return [
    test.assertTrue(resp.errors.length === 0, `Errors were thrown on null output from step: ${describe(resp.errors)}`)
  ];
}

[]
  .concat(flowWorksWithNull());
