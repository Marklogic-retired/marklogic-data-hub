const test = require("/test/test-helper.xqy");

function invokeService(entityTypeId, propertyPath, referenceType, pattern, limit) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/entitySearch/getMatchingPropertyValues.sjs",
      {
        "entityTypeId": entityTypeId,
        "propertyPath": propertyPath,
        "referenceType": referenceType,
        "pattern": pattern,
        "limit": limit
      }
  ));
}

// Uncomment the tests when DHFPROD-4494 bug is resolved.
/*function testMatchingValuesStartingWithPattern() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "numericStringEntityProp/stringCityProp";
  const result = invokeService(entityTypeId, propertyPath, "path", "doc2", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop"))
  ];
}

function testMatchingValuesWithPatternInBetween() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "numericStringEntityProp/stringCityProp";
  const result = invokeService(entityTypeId, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop")),
    test.assertTrue(result.includes("doc1City1Prop")),
    test.assertTrue(result.includes("doc1City2Prop"))
  ];
}

function testMatchingValuesOnRangePathOneLevelNesting() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "numericStringEntityProp/stringCityProp";
  const result = invokeService(entityTypeId, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop")),
    test.assertTrue(result.includes("doc1City1Prop")),
    test.assertTrue(result.includes("doc1City2Prop"))
  ];
}

function testMatchingValuesOnRangePathNoNesting() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "searchEntityProp2";
  const result = invokeService(entityTypeId, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc1SrchEntyProp2")),
    test.assertTrue(result.includes("doc2SrchEntyProp2")),
  ];
}

function testMatchingValuesWithLimit() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "numericStringEntityProp/stringCityProp";
  const result = invokeService(entityTypeId, propertyPath, "path", "city", 3);
  return [
    test.assertEqual(3, result.length)
  ];
}*/

function testMatchingValuesOnRangeElementIndexes() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "stringNameProp";
  const result = invokeService(entityTypeId, propertyPath, "element", "name", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2Name1Prop")),
    test.assertTrue(result.includes("doc2Name2Prop")),
    test.assertTrue(result.includes("doc1Name1Prop")),
    test.assertTrue(result.includes("doc1Name2Prop"))
  ];
}

function testMatchingValuesOnRangeFieldIndexes() {
  let entityTypeId = "http://marklogic.com/EntitySearchEntity-0.0.1/EntitySearchEntity";
  let propertyPath = "datahubCreatedInFlow";
  const result = invokeService(entityTypeId, propertyPath, "field", "flow", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("my-flow-1")),
    test.assertTrue(result.includes("my-flow-2"))
  ];
}

function testMatchingValuesOnCollectionNames() {
  let entityTypeId = "";
  let propertyPath = "";
  const result = invokeService(entityTypeId, propertyPath,"collection", "doc", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc1")),
    test.assertTrue(result.includes("doc2"))
  ];
}

[]
.concat(testMatchingValuesOnRangeElementIndexes())
.concat(testMatchingValuesOnRangeFieldIndexes())
.concat(testMatchingValuesOnCollectionNames());
/*
.concat(testMatchingValuesStartingWithPattern())
.concat(testMatchingValuesWithPatternInBetween())
.concat(testMatchingValuesOnRangePathOneLevelNesting())
.concat(testMatchingValuesOnRangePathNoNesting())
.concat(testMatchingValuesWithLimit())
.concat(testMatchingValuesOnRangeElementIndexes())
.concat(testMatchingValuesOnRangeFieldIndexes())
.concat(testMatchingValuesOnCollectionNames());*/
