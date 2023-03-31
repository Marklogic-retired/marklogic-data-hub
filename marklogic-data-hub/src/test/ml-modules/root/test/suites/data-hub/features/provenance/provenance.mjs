import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

const datahub = DataHubSingleton.instance();

const content = ["/content/valid-customer.json"].map(uri => {
    return {
        uri: uri,
        value: cts.doc(uri)
    };
});

let results = datahub.flow.runFlow('CustomerMapping', 'test-job', content, {provenanceGranularityLevel: 'coarse'}, 1);

let assertions = [
    test.assertEqual(1, hubTest.getProvenanceCount(), "one provenance document in jobs database")
];


assertions;


