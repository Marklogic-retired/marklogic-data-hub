const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const entityType = "http://www.marklogic.com/Customer-0.0.1/Customer";

function testvalidateAndTestMapping(mapURI = "/mappings/CustomerMapping/CustomerMapping-0.mapping.json", uri = "/content/valid-customer.json") {
  let map = cts.doc(mapURI).toObject();
  let result = esMappingLib.validateAndTestMapping(map, uri);
  return [
    test.assertEqual(111, fn.number(result.properties.Id.output), `Expected output '111', got '${xdmp.describe(result.properties.Id)}'`),
    test.assertEqual("Smith", result.properties.LastName.output, `Expected output 'Smith', got '${xdmp.describe(result.properties.LastName)}'`),
    test.assertEqual("Jane", result.properties.FirstName.output, `Expected output 'Jane', got '${xdmp.describe(result.properties.FirstName)}'`),
    test.assertEqual("Details found here", result.properties.Notes.output, `Expected output 'Details found here', got '${xdmp.describe(result.properties.Notes)}'`)
  ];
}

testvalidateAndTestMapping();
