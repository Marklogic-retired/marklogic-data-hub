const test = require("/test/test-helper.xqy");
const entitySearchService = require("/test/suites/data-hub/5/data-services/lib/entitySearchService.sjs");

let assertions = [];
let saveQuery = JSON.stringify({
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

function testGetQuery() {
  let id = entitySearchService.saveQuery(saveQuery).savedQuery.id;
  let result = JSON.parse(entitySearchService.getSavedQuery(id));
  assertions.push(
      test.assertNotEqual(null, result),
      test.assertNotEqual(null, result.savedQuery),
      test.assertNotEqual(null, result.savedQuery.systemMetadata),
      test.assertEqual(id, result.savedQuery.id),
      test.assertEqual(xdmp.getCurrentUser(), result.savedQuery.owner),
      test.assertEqual(4, Object.keys(result.savedQuery.systemMetadata).length)
  );

  id = "some-non-existent-query-id";
  result = entitySearchService.getSavedQuery(id);
  assertions.push(
      test.assertNotEqual(null, result),
      test.assertEqual(null, result.savedQuery),
      test.assertEqual(0, Object.keys(result).length)
  );
}

function testGetQueries() {
  const result = entitySearchService.getSavedQueries();
  assertions.push(
      test.assertNotEqual(null, result),
      test.assertEqual(1, result.length)
  );
  return assertions;
}

[]
    .concat(testGetQuery())
    .concat(testGetQueries());
