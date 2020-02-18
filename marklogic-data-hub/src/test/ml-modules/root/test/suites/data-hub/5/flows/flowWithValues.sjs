const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const emptySequence = Sequence.from([]);

function describe(item) {
  return xdmp.describe(item, emptySequence, emptySequence);
}

function flowWorksWithValues() {
  let resp = datahub.flow.runFlow('CustomerByValue', 'value-test-job', [], 
  { provenanceGranularityLevel: 'off', "uris":["comma-separated","uris","of","records","to","process"]}, 1);
  return [
    test.assertTrue(resp.errors.length === 0, `Errors were thrown on values input from step: ${describe(resp.errors)}`)
  ];
}

[]
  .concat(flowWorksWithValues());
