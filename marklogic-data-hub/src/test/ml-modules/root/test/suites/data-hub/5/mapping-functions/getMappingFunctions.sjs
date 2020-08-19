const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const xpathFunctions = esMappingLib.getXpathMappingFunctions();
const mlFunctions = esMappingLib.getMarkLogicMappingFunctions();
[
  test.assertTrue(xpathFunctions["sum"] != null),
  test.assertTrue(xpathFunctions["distinct-values"] == null),
  test.assertTrue(xpathFunctions["base-uri"] == null),
  test.assertTrue(xpathFunctions["document-uri"] == null),
  test.assertTrue(xpathFunctions["sum"]["signature"].includes("sum")),
  test.assertTrue(xpathFunctions["fn:sum"] == null, "'fn:' has been stripped from the function name and signature"),
  test.assertTrue(Object.keys(xpathFunctions).length >= 116,
    "As of 10.0-4 server, there are 116 mapping xpath functions (accounting for all excluded ones); " +
    "there may be more in a future version, but we expect at least that many to exist; actual length: " + Object.keys(xpathFunctions).length),

  test.assertTrue(Object.keys(mlFunctions).length >= 4,
    "There are 4 OOTB mapping functions that are being shipped with DHF; there may be more from other tests in the suite, " +
    "but we expect at least those 4 to exist. Found " + Object.keys(mlFunctions).length)
];
