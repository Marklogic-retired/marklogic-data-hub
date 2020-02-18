const test = require("/test/test-helper.xqy");

function invokeService(entityName, facetName, indexType, searchStr, limit) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/searchFacetValues/searchFacetValues.sjs",
      {
        "entityName": entityName,
        "facetName": facetName,
        "indexType": indexType,
        "searchStr": searchStr,
        "limit": limit
      }
  ));
}

function testSearchOnRangePathIndexes() {
  const result = invokeService("SearchFacetsEntity", "searchStrNameFacet",
      "rangeIndex", "name", 10);
  return [
    test.assertEqual(3, result.length),
    test.assertTrue(result.includes("firstName1")),
    test.assertTrue(result.includes("firstName2")),
    test.assertTrue(result.includes("firstName3"))
  ];
}

function testSearchOnRangeElementIndexes() {
  const result = invokeService("", "searchStrCityFacet", "elementRangeIndex",
      "ra", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("ranchi")),
    test.assertTrue(result.includes("Raleigh"))
  ];
}

function testSearchOnRangeFieldIndexes() {
  const result = invokeService("", "datahubCreatedInFlow", "fieldRangeIndex",
      "flow", 10);
  return [
    test.assertEqual(3, result.length),
    test.assertTrue(result.includes("my-flow-1")),
    test.assertTrue(result.includes("my-flow-2")),
    test.assertTrue(result.includes("my-flow-3"))
  ];
}

function testSearchOnCollectionNames() {
  const result = invokeService("", "", "collection", "doc", 10);
  return [
    test.assertEqual(3, result.length),
    test.assertTrue(result.includes("doc1")),
    test.assertTrue(result.includes("doc2")),
    test.assertTrue(result.includes("doc3"))
  ];
}

[]
.concat(testSearchOnRangePathIndexes())
.concat(testSearchOnRangeElementIndexes())
.concat(testSearchOnRangeFieldIndexes())
.concat(testSearchOnCollectionNames());