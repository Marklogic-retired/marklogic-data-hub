const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
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

function testDeleteExistingSavedQuery() {
  let id = entitySearchService.saveQuery(saveQuery).savedQuery.id;
  let result = entitySearchService.deleteSavedQuery(id);
  let resultAfterDeletion = entitySearchService.getSavedQueries();
  return [
    test.assertEqual(null, result),
    test.assertEqual(0, resultAfterDeletion.length)
  ]
}

function testDeleteNonExistingSavedQuery() {
  id = "some-non-existent-query-id";
  result = JSON.parse(entitySearchService.deleteSavedQuery(id));
  return [
    test.assertEqual(null, result)
  ]
}

hubTest.runWithRolesAndPrivileges(['hub-central-saved-query-user'], [], function() {
  assertions = []
    .concat(testDeleteExistingSavedQuery())
    .concat(testDeleteNonExistingSavedQuery());
});

assertions;