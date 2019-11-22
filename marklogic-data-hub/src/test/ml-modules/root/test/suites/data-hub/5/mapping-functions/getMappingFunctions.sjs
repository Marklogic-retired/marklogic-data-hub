const mappingFunctions = require('/marklogic.rest.resource/mlMappingFunctions/assets/resource.sjs');
const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

if (esMappingLib.versionIsCompatibleWithES()) {
  let mapFuncs = mappingFunctions.getXpathFunctions();
 [
 xdmp.log(mapFuncs),
    test.assertTrue(mapFuncs["sum"] != null),
    test.assertTrue(mapFuncs["base-uri"] == null),
    test.assertTrue(mapFuncs["document-uri"] == null),
    test.assertTrue(mapFuncs["sum"]["signature"].includes("sum")),
    test.assertTrue(mapFuncs["fn:sum"] == null ,"'fn:' has been stripped from the function name and signature"),
    test.assertTrue(Object.keys(mapFuncs).length >= 127,
      "As of 10.0-2 server, there are 127 mapping xpath functions (base-uri and document-uri have been removed); there may be more in a future version, but we expect at least that many to exist"),

    test.assertTrue(Object.keys(mappingFunctions.getMarkLogicFunctions()).length >= 4,
      "There are 4 OOTB mapping functions that are being shipped with DHF; there may be more from other tests in the suite, but we expect at least those 4 to exist. Found "+Object.keys(mappingFunctions.getMarkLogicFunctions()).length)

  ];
}
