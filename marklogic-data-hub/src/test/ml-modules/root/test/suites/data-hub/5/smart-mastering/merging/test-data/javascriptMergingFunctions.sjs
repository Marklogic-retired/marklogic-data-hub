'use strict';
const test = require('/test/test-helper.xqy');

function quickStartMergeTriples(
    mergeOptions,
    docs,
    sources,
    tripleMerge
) {
    test.assertTrue(fn.exists(mergeOptions.merging), `QuickStart merge triples should use JSON QuickStart options. Options: ${xdmp.toJsonString(mergeOptions)}`);
    test.assertTrue(fn.exists(tripleMerge.function), `QuickStart merge triples should use JSON quickStart tripleMerge. Options: ${xdmp.toJsonString(tripleMerge)}`);
    test.assertTrue(fn.exists(tripleMerge.at), `QuickStart merge triples should use JSON QuickStart options. Options: ${xdmp.toJsonString(tripleMerge)}`);
    return sem.triple('QuickStart','with', 'JavaScript');
}

function hubCentralMergeTriples(
    mergeOptions,
    docs,
    sources,
    tripleMerge
) {
    test.assertTrue(fn.exists(mergeOptions.mergeRules), `Hub Central merge triples should use JSON Hub Central options. Options: ${xdmp.toJsonString(mergeOptions)}`);
    test.assertTrue(fn.exists(tripleMerge.function), `Hub Central merge triples should use JSON Hub Central tripleMerge. Options: ${xdmp.toJsonString(tripleMerge)}`);
    test.assertTrue(fn.exists(tripleMerge.at), `Hub Central merge triples should use JSON Hub Central options. Options: ${xdmp.toJsonString(tripleMerge)}`);
    return sem.triple('Hub Central','with', 'JavaScript');
}

function quickStartMergeProperties(
    propertyName,
    allProperties,
    mergeRule
) {
    test.assertTrue(fn.exists(mergeRule.propertyName), `QuickStart property function should use JSON Hub Central options. Options: ${xdmp.toJsonString(mergeRule)}`);
    return {
        name: propertyName,
        values: 'QuickStart JavaScript Merge'
    };
}

function hubCentralMergeProperties(
    propertyName,
    allProperties,
    mergeRule
) {
    test.assertTrue(fn.exists(mergeRule.documentXPath), `QuickStart property function should use JSON QuickStart options. Options: ${xdmp.toJsonString(mergeRule)}`);
    return {
        name: propertyName,
        values: 'Hub Central JavaScript Merge'
    };
}

module.exports = {
    quickStartMergeTriples,
    hubCentralMergeTriples,
    quickStartMergeProperties,
    hubCentralMergeProperties
};