const test = require("/test/test-helper.xqy");

function invokeService() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/security/getAuthorities.sjs",
        {}
    ));
}

const response = invokeService();

[
    test.assertEqual("flow-developer", xdmp.getCurrentUser()),
    test.assertEqual(8, response.authorities.length),
    test.assertEqual("canWriteLoadData,canReadLoadData,canWriteFlows,canReadFlows," +
        "canWriteStepDefinitions,canReadStepDefinitions,canWriteMappings,canReadMappings",
        response.authorities.toString()),
    test.assertEqual(15, response.roles.length),
    test.assertEqual("data-hub-operator,data-hub-entity-model-reader,data-hub-mapping-writer," +
        "data-hub-mapping-reader,data-hub-load-data-writer,data-hub-module-writer," +
        "data-hub-load-data-reader,data-hub-job-reader,data-hub-flow-reader,data-hub-step-definition-reader," +
        "data-hub-step-definition-writer,data-hub-flow-writer,data-hub-module-reader,data-hub-developer,data-hub-entity-model-writer",
        response.roles.toString())
]
