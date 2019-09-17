const mappingFunctions = require('/data-hub/5/extensions/mappingFunctions.sjs');
const test = require("/test/test-helper.xqy");

function testMappingFunctions() {
return [
    test.assertEqual(129, Object.keys(mappingFunctions.getXpathFunctions()).length),
    test.assertEqual(4, Object.keys(mappingFunctions.getMarkLogicFunctions()).length)
  ];
}

[].concat(testMappingFunctions());
