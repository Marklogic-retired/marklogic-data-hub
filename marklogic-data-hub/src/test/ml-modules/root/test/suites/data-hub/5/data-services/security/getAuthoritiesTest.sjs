const test = require("/test/test-helper.xqy");

function invokeService() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/security/getAuthorities.sjs",
        {}
    ));
}

const response = invokeService();
const minExpectedAuthorities = ["canReadLoadData", "canReadFlows", "canReadStepDefinitions", "canReadMappings", "canReadMatching"];
const minExpectedRoles = ["data-hub-operator", "data-hub-entity-model-reader", "data-hub-job-reader", "data-hub-flow-reader",
    "data-hub-step-definition-reader", "data-hub-load-data-reader", "data-hub-match-merge-reader", "data-hub-mapping-reader",
    "data-hub-saved-query-reader", "data-hub-saved-query-writer", "data-hub-module-reader"];

const result = [
    // The inequality references are assuming that the least priveleged role used to run the tests is data-hub-operator
    test.assertEqual("flow-developer", xdmp.getCurrentUser()),
    test.assertTrue(response.authorities.length >= 5, "The minimum number of authorities any user has"),
    test.assertTrue(minExpectedAuthorities.every(authority => response.authorities.includes(authority))),
    test.assertTrue(response.roles.length >= 11, "The minimum number of roles any user has"),
    test.assertTrue(minExpectedRoles.every(role => response.roles.includes(role)))
];

result;
