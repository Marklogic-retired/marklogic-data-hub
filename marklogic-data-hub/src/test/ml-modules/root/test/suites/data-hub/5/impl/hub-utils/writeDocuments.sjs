'use strict';

const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const hubUtils = new HubUtils();
const test = require("/test/test-helper.xqy");

const results = [];
try {
    hubUtils.writeDocuments([{uri: "/0.json", value: {}},{uri: "/1.json", value: {}},{uri: "/1.json", value: {}},{uri: "/2.json", value: {}}]);
    test.assertTrue(false,'Should have thrown error for duplicate URIs!');
} catch (e) {
    results.push(test.assertEqual('Attempted to write to the same URI multiple times in the same transaction. URI: /1.json',e.message));
}
// Testing with JSON Object value
try {
    hubUtils.writeDocuments([{uri: "/customerObject.json", value: { envelope: { instance: { info: {version: '0.0.1', title: 'Customer'}, Customer: { customerId: [1,2]}}}}}]);
    test.assertTrue(false,'Should have thrown error for multiple identifiers in an entity instance!');
} catch (e) {
    results.push(test.assertEqual('Cannot write Customer instance with multiple values for identifier property. URI: /customerObject.json',e.message));
}
// Testing with JSON Node value
try {
    hubUtils.writeDocuments([{uri: "/customerNode.json", value: xdmp.toJSON({ envelope: { instance: { info: {version: '0.0.1', title: 'Customer'}, Customer: { customerId: [1,2]}}}})}]);
    test.assertTrue(false,'Should have thrown error for multiple identifiers in an entity instance!');
} catch (e) {
    results.push(test.assertEqual('Cannot write Customer instance with multiple values for identifier property. URI: /customerNode.json', e.message));
}

results;