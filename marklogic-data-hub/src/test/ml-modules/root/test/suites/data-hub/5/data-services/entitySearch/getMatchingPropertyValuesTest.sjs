const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');

let assertions = [];

function invokeService(entityTypeId, propertyPath, referenceType, pattern, limit, ignoreArtifactCollections = false) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/entitySearch/getMatchingPropertyValues.sjs",
      {
        "facetValuesSearchQuery": JSON.stringify({
          "entityTypeId": entityTypeId,
          "propertyPath": propertyPath,
          "referenceType": referenceType,
          "pattern": pattern,
          "limit": limit,
          "ignoreArtifactCollections": ignoreArtifactCollections
        })
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

function testMatchingValuesOnCollectionNamesIgnoringArtifacts() {
  const assertions = [];
  let entityTypeId = "";
  let propertyPath = "";
  let result = invokeService(entityTypeId, propertyPath,"collection", "doc", 10, true);
  assertions.push(
    test.assertEqual(2, result.length),
    test.assertTrue(result.includes("doc1")),
    test.assertTrue(result.includes("doc2"))
  );
  result = invokeService(entityTypeId, propertyPath,"collection", "step", 10, true);
  assertions.push(
      test.assertEqual(0, result.length)
  );
  return assertions;
}

function getAllArtifactCollectionsTest() {
  const expectedArtifactCollections = [
    "http://marklogic.com/data-hub/steps/ingestion",
    "http://marklogic.com/data-hub/steps",
    "http://marklogic.com/data-hub/flow",
    "http://marklogic.com/data-hub/step-definition",
    "http://marklogic.com/data-hub/steps/mapping",
    "http://marklogic.com/data-hub/mappings",
    "http://marklogic.com/data-hub/steps/matching",
    "http://marklogic.com/data-hub/steps/merging",
    "http://marklogic.com/data-hub/steps/mastering",
    "http://marklogic.com/data-hub/steps/custom"
  ];
  const artifactCollections = Artifacts.getAllArtifactCollections();

  return [
    test.assertEqual(expectedArtifactCollections, artifactCollections)
  ]
}

hubTest.runWithRolesAndPrivileges(['hub-central-entity-model-reader'], [], function() {
  assertions = []
    .concat(testMatchingValuesOnRangeElementIndexes())
    .concat(testMatchingValuesOnRangeFieldIndexes())
    .concat(testMatchingValuesOnCollectionNames())
    .concat(testMatchingValuesOnCollectionNamesIgnoringArtifacts())
    .concat(getAllArtifactCollectionsTest());
  /*
  .concat(testMatchingValuesStartingWithPattern())
  .concat(testMatchingValuesWithPatternInBetween())
  .concat(testMatchingValuesOnRangePathOneLevelNesting())
  .concat(testMatchingValuesOnRangePathNoNesting())
  .concat(testMatchingValuesWithLimit())
  .concat(testMatchingValuesOnRangeElementIndexes())
  .concat(testMatchingValuesOnRangeFieldIndexes())
  .concat(testMatchingValuesOnCollectionNames());*/;
});

assertions;
