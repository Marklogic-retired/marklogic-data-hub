const test = require("/test/test-helper.xqy");

function invokeService(entityName, facetName, indexType) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/numericFacetValuesRange/numericFacetValuesRange.sjs",
      {
        "entityName": entityName,
        "facetName": facetName,
        "indexType": indexType
      }
  ));
}

function testIntFacetsRange() {
  const result = invokeService("SearchFacetsEntity", "numRangeIntProp", "elementRangeIndex");
  return [
    test.assertEqual(1, result.min),
    test.assertEqual(2147483647, result.max)
  ];
}

function testIntegerFacetsRange() {
  const result = invokeService("SearchFacetsEntity", "numRangeIntegerProp", "elementRangeIndex");
  return [
    test.assertEqual(1.5, result.min),
    test.assertEqual(120.5, result.max)
  ];
}

function testLongFacetsRange() {
  const result = invokeService("SearchFacetsEntity", "numRangeLongProp", "elementRangeIndex");
  return [
    test.assertEqual(1, result.min),
    test.assertEqual(650, result.max)
  ];
}

function testFloatFacetsRange() {
  const result = invokeService("SearchFacetsEntity", "numRangeFloatProp", "elementRangeIndex");
  return [
    test.assertEqual(1.5, result.min),
    test.assertEqual(1500.00, result.max)
  ];
}

function testDoubleFacetsRange() {
  const result = invokeService("SearchFacetsEntity", "numRangeDoubleProp", "elementRangeIndex");
  return [
    test.assertEqual(1.5, result.min),
    test.assertEqual(9.22337203685478e18, result.max)
  ];
}

[]
.concat(testIntFacetsRange())
.concat(testIntegerFacetsRange())
.concat(testLongFacetsRange())
.concat(testFloatFacetsRange())
.concat(testDoubleFacetsRange());