const test = require("/test/test-helper.xqy");

function invokeService(entityIRI, propertyPath, referenceType, pattern, limit) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/entitySearch/getMatchingPropertyValues.sjs",
      {
        "entityIRI": entityIRI,
        "propertyPath": propertyPath,
        "referenceType": referenceType,
        "pattern": pattern,
        "limit": limit
      }
  ));
}

// Uncomment the tests when DHFPROD-4494 bug is resolved.
/*function testMatchingValuesStartingWithPattern() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/strCityProp";
  const result = invokeService(entityIRI, propertyPath, "path", "doc2", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop"))
  ];
}

function testMatchingValuesWithPatternInBetween() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/strCityProp";
  const result = invokeService(entityIRI, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop")),
    test.assertTrue(result.includes("doc1City1Prop")),
    test.assertTrue(result.includes("doc1City2Prop"))
  ];
}

function testMatchingValuesOnRangePathOneLevelNesting() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/strCityProp";
  const result = invokeService(entityIRI, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2City1Prop")),
    test.assertTrue(result.includes("doc2City2Prop")),
    test.assertTrue(result.includes("doc1City1Prop")),
    test.assertTrue(result.includes("doc1City2Prop"))
  ];
}

function testMatchingValuesOnRangePathNoNesting() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "srchEntyProp2";
  const result = invokeService(entityIRI, propertyPath, "path", "city", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc1SrchEntyProp2")),
    test.assertTrue(result.includes("doc2SrchEntyProp2")),
  ];
}

function testMatchingValuesWithLimit() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "numStrEntityProp/strCityProp";
  const result = invokeService(entityIRI, propertyPath, "path", "city", 3);
  return [
    test.assertEqual(3, result.length)
  ];
}*/

function testMatchingValuesOnRangeElementIndexes() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "strNameProp";
  const result = invokeService(entityIRI, propertyPath, "element", "name", 10);
  return [
    test.assertEqual(4, result.length),
    test.assertTrue(result.includes("doc2Name1Prop")),
    test.assertTrue(result.includes("doc2Name2Prop")),
    test.assertTrue(result.includes("doc1Name1Prop")),
    test.assertTrue(result.includes("doc1Name2Prop"))
  ];
}

function testMatchingValuesOnRangeFieldIndexes() {
  let entityIRI = "http://marklogic.com/EntitiesSearchEntity-0.0.1/EntitiesSearchEntity";
  let propertyPath = "datahubCreatedInFlow";
  const result = invokeService(entityIRI, propertyPath, "field", "flow", 10);
  return [
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("my-flow-1")),
    test.assertTrue(result.includes("my-flow-2"))
  ];
}

function testMatchingValuesOnCollectionNames() {
  let entityIRI = "";
  let propertyPath = "";
  const result = invokeService(entityIRI, propertyPath,"collection", "doc", 10);
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
