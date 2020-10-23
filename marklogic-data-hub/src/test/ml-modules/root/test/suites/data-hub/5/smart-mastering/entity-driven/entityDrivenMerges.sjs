const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const merge = require('/data-hub/5/builtins/steps/mastering/default/merging.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(content, results) {
    let instance = fn.head(results.xpath('//*:instance'));
    return assertions.concat([
        test.assertEqual(2, fn.count(instance.xpath('*')), `Should have 2 direct children of instance (es:info and instance). Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('Holland Wells', fn.string(instance.xpath('*/*:name')), `Should have name of 'Holland Wells'. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('1985-01-01', fn.string(instance.xpath('*/*:birthDate')), `Should have birth date of '1985-01-01'. Results: ${xdmp.toJsonString(instance)}`)
    ]);
}

function testMerge(content, stepId) {
    const results = merge.main(content, { stepId}).filter((doc) => {
        return doc.uri.includes(content.uri);
    })[0].value;
    return verifyResults(content, results);
}

function testJsonMerge() {
    const content = { uri:'CustMerged' };
    return testMerge(content, 'mergeCustomers-merging');
}

function testNamespacedXmlMerge() {
    const content = { uri:'NsCustMerged'};
    return testMerge(content, 'mergeNamespacedCustomers-merging');
}

assertions
//    .concat(testJsonMerge())
    .concat(testNamespacedXmlMerge());
