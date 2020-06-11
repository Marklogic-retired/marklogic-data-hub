const test = require("/test/test-helper.xqy");

function invokeService() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/hubCentral/getAuthorities.sjs",
        {}
    ));
}

const response = invokeService();
const minExpectedAuthorities = ["operator"];

const result = [
    // The inequality references are assuming that the least privileged role used to run the tests is data-hub-operator
    test.assertTrue(response.authorities.length >= minExpectedAuthorities.length, "The minimum number of authorities any user has"),
    test.assertTrue(minExpectedAuthorities.every(authority => response.authorities.includes(authority)))
];

result;
