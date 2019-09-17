const mappingFunctions = require('/data-hub/5/extensions/mappingFunctions.sjs');
const test = require("/test/test-helper.xqy");

function testMappingFunctions() {
return [
    test.assertEqual(129, Object.keys(mappingFunctions.getXpathFunctions()).length, "As of 10.0-2 server, there are 129 xpath functions"),
    test.assertEqual(4, Object.keys(mappingFunctions.getMarkLogicFunctions()).length, "There are 4 OOTB mapping functions that are being shipped with DHF")
  ];
}

[].concat(testMappingFunctions());
