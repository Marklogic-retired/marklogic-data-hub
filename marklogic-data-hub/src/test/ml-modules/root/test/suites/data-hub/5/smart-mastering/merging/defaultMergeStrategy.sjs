'use strict';
const merge = require('/data-hub/5/builtins/steps/mastering/default/merging.sjs');
const test = require("/test/test-helper.xqy");

const assertions = [];

function verifyResults(content, results) {
    let instance = fn.head(results.xpath('//*:instance'));
    let addresses = instance.xpath('.//Address');
    let assertions = [
        test.assertEqual(2, fn.count(instance.xpath('*')), `Should have 2 direct children of instance (es:info and instance). Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('Holland Wells', fn.string(instance.xpath('*/name')), `Should have name of 'Holland Wells'. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual('1985-01-01', fn.string(instance.xpath('*/birthDate')), `Should have birth date of '1985-01-01'. Results: ${xdmp.toJsonString(instance)}`),
        test.assertEqual(2, fn.count(addresses), `Should have only one address because default rule only likes Virginia. Results: ${xdmp.toJsonString(addresses)}`),
    ];
    for (let address of addresses) {
        assertions.push(test.assertEqual('Virginia', fn.string(address.xpath('state')), `State for only address be 'Virginia' because default rule only likes Virginia. Results: ${xdmp.toJsonString(address)}`))
    }
    return assertions;
}

function testMerge(content, stepId) {
    const results = merge.main(content, {stepId}).filter((doc) => {
        return doc.uri.includes('CustMerged');
    })[0].value;
    return verifyResults(content, results);
}

function testDefaultMerge() {
    const content = {
        uri:'/content/customerMatchSummary.json'
    };
    return testMerge(content, 'mergeCustomers-merging');
}

assertions
    .concat(testDefaultMerge());