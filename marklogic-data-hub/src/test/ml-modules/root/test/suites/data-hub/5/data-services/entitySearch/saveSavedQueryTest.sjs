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

function testSaveAndModifyQuery() {
  let insertedQuery = entitySearchService.saveQuery(saveQuery);
  const uri = "/saved-queries/" + insertedQuery.savedQuery.id + ".json";
  const permissions = JSON.parse(xdmp.invokeFunction(() => {
    let permissions = {};
    xdmp.documentGetPermissions(uri).forEach(permission => permissions[xdmp.roleName(permission.roleId)] = permission.capability);
    return permissions;
  }, {transactionMode:'update-auto-commit'}));
  assertions.push(
      test.assertNotEqual(null, insertedQuery),
      test.assertNotEqual(null, insertedQuery.savedQuery),
      test.assertNotEqual(null, insertedQuery.savedQuery.systemMetadata),
      test.assertNotEqual(null, insertedQuery.savedQuery.id),
      test.assertEqual("some-query", insertedQuery.savedQuery.name),
      test.assertEqual(4, Object.keys(insertedQuery.savedQuery.systemMetadata).length),
      test.assertEqual(xdmp.getCurrentUser(), insertedQuery.savedQuery.owner),
      test.assertEqual(permissions["data-hub-saved-query-writer"], "update"),
      test.assertEqual(permissions["data-hub-saved-query-reader"], "read"),
      test.assertEqual(xdmp.documentGetCollections(uri), ["http://marklogic.com/data-hub/saved-query"])
  );

  // saving query doc with an already existing query name
  test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.saveQuery')), saveQuery, null);

  const id = insertedQuery.savedQuery.id;
  insertedQuery.savedQuery.name = "modified-query";
  const updatedQuery = entitySearchService.updateSavedQuery(JSON.stringify(insertedQuery));
  assertions.push(
      test.assertNotEqual(null, updatedQuery),
      test.assertNotEqual(null, updatedQuery.savedQuery),
      test.assertNotEqual(null, updatedQuery.savedQuery.systemMetadata),
      test.assertEqual(id, updatedQuery.savedQuery.id),
      test.assertEqual("modified-query", updatedQuery.savedQuery.name),
      test.assertEqual(4, Object.keys(updatedQuery.savedQuery.systemMetadata).length),
      test.assertEqual(xdmp.getCurrentUser(), updatedQuery.savedQuery.owner),
      test.assertEqual(permissions["data-hub-saved-query-writer"], "update"),
      test.assertEqual(permissions["data-hub-saved-query-reader"], "read"),
      test.assertEqual(xdmp.documentGetCollections(uri), ["http://marklogic.com/data-hub/saved-query"])
  );

  return assertions;
}

function testSaveAndModifyQueryExceptions() {
  let tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.saveQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['name'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.saveQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['query'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.saveQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['propertiesToDisplay'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.saveQuery')), JSON.stringify(tempQuery), null));

  let insertedQuery = JSON.stringify(entitySearchService.saveQuery(saveQuery));

  tempQuery = JSON.parse(insertedQuery);
  tempQuery['savedQuery'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.updateSavedQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['name'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.updateSavedQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['query'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.updateSavedQuery')), JSON.stringify(tempQuery), null));

  tempQuery = JSON.parse(saveQuery);
  tempQuery['savedQuery']['propertiesToDisplay'] = undefined;
  assertions.push(test.assertThrowsError(xdmp.function(xs.QName('entitySearchService.updateSavedQuery')), JSON.stringify(tempQuery), null));

  return assertions;
}

[]
    .concat(testSaveAndModifyQuery())
    .concat(testSaveAndModifyQueryExceptions());
