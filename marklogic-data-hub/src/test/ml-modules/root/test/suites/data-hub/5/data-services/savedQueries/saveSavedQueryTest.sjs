const test = require("/test/test-helper.xqy");

var saveQuery = JSON.stringify({
  "savedQuery": {
    "id": "",
    "name": "some-query",
    "description": "some-query-description",
    "query": {
      "searchText": "some-string",
      "entityTypeIds": [
        "Entity1"
      ],
      "selectedFacets": {
        "Collection": {
          "dataType": "string",
          "stringValues": [
            "Entity1",
            "Collection1"
          ]
        },
        "facet1": {
          "dataType": "decimal",
          "rangeValues": {
            "lowerBound": "2.5",
            "upperBound": "15"
          }
        },
        "facet2": {
          "dataType": "dateTime",
          "rangeValues": {
            "lowerBound": "2020-01-01T13:06:17",
            "upperBound": "2020-01-22T13:06:17"
          }
        }
      }
    },
    "propertiesToDisplay": ["facet1", "EntityTypeProperty1"]
  }
});

function invokeService(saveQuery) {
  return fn.head(xdmp.invoke(
      "/data-hub/5/data-services/savedQueries/saveSavedQuery.sjs",
      {
        "saveQuery": saveQuery
      }
  ));
}


function testSaveNewQuery() {
  const result = invokeService(saveQuery);
  return [
    test.assertNotEqual(null, result),
    test.assertNotEqual(null, result.savedQuery),
    test.assertNotEqual(null, result.savedQuery.systemMetadata),
    test.assertNotEqual(null, result.savedQuery.id),
    test.assertEqual("some-query", result.savedQuery.name),
    test.assertEqual(4, Object.keys(result.savedQuery.systemMetadata).length),
    test.assertEqual("flow-developer", result.savedQuery.owner)
  ];
}

function testModifyQuery() {
  let insertedQuery = invokeService(saveQuery);
  const id = insertedQuery.savedQuery.id;
  insertedQuery.savedQuery.name = "modified-query";
  const result = invokeService(JSON.stringify(insertedQuery));
  return [
    test.assertNotEqual(null, result),
    test.assertNotEqual(null, result.savedQuery),
    test.assertNotEqual(null, result.savedQuery.systemMetadata),
    test.assertEqual(id, result.savedQuery.id),
    test.assertEqual("modified-query", result.savedQuery.name),
    test.assertEqual(4, Object.keys(result.savedQuery.systemMetadata).length),
    test.assertEqual("flow-developer", result.savedQuery.owner)
  ];
}

[]
    .concat(testSaveNewQuery())
    .concat(testModifyQuery());
