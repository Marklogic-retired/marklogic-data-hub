const test = require("/test/test-helper.xqy");

function invokeService() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/mapping/getMappingFunctions.sjs",
        {}
    ));
}

function testGetMappinFunctions() {
    const mapFuncs = invokeService();
    [
        test.assertTrue(Object.keys(mapFuncs).length >= 100),
        test.assertTrue(mapFuncs["sum"] != null),
        test.assertTrue(mapFuncs["sum"]["signature"].includes("sum")),
        test.assertTrue(mapFuncs["doc"] != null),
        test.assertTrue(mapFuncs["current-dateTime"] != null),
        test.assertTrue(mapFuncs["fn:sum"] == null, "'fn:' has been stripped from the function name and signature"),

    ];
}

testGetMappinFunctions();
