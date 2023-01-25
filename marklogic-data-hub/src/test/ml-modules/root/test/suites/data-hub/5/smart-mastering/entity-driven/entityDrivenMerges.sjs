
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const merge = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mastering/default/merging.mjs");
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(content, results) {
    let instance = fn.head(results.xpath('//*:instance'));
    return [
        test.assertEqual(2, fn.count(instance.xpath('*')), `Should have 2 direct children of instance (es:info and instance). Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('Holland Wells', fn.string(instance.xpath('*/*:name')), `Should have name of 'Holland Wells'. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('1985-01-01', fn.string(instance.xpath('*/*:birthDate')), `Should have birth date of '1985-01-01'. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual(false, fn.data(instance.xpath('*/*:active')), `Should have active value of false. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual("WI", fn.data(instance.xpath('*/*:billing/*:Address/*:state')), `Should have billing state value of "WI" from source 3. Results: ${xdmp.toJsonString(instance)}`)
    ];
}

function testMerge(content, stepId) {
    const results = merge.main(content, {stepId}).filter((doc) => {
            return doc.uri.includes('CustMerged');
        });
    let assertions = [];
    results.forEach((result) => {
        const asserts = verifyResults(content, result.value);
        assertions = assertions.concat(asserts);
    });
    return assertions;
}

function testJsonMerge() {
    const content = { uri:'/content/customerMatchSummary.json' };
    return testMerge(content, 'mergeCustomers-merging');
}

function testNamespacedXmlMerge() {
    const content = { uri:'/content/namespacedCustomerMatchSummary.json'};
    return testMerge(content, 'mergeNamespacedCustomers-merging');
}

assertions
    .concat(testJsonMerge())
    .concat(testNamespacedXmlMerge());
