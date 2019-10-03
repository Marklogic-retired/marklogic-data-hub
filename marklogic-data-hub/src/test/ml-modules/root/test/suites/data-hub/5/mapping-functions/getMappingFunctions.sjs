const mappingFunctions = require('/marklogic.rest.resource/mlMappingFunctions/assets/resource.sjs');
const test = require("/test/test-helper.xqy");

[
  test.assertTrue(Object.keys(mappingFunctions.getXpathFunctions()).length >= 129,
    "As of 10.0-2 server, there are 129 xpath functions; there may be more in a future version, but we expect at least that many to exist"),
  
  test.assertTrue(Object.keys(mappingFunctions.getMarkLogicFunctions()).length >= 4,
    "There are 4 OOTB mapping functions that are being shipped with DHF; there may be more from other tests in the suite, but we expect at least those 4 to exist")
];
