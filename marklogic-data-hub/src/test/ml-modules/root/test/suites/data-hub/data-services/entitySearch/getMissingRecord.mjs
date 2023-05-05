import entitySearchService from "/test/suites/data-hub/data-services/lib/entitySearchService.mjs";
const test = require("/test/test-helper.xqy");

const assertions = [];

try {
  entitySearchService.getRecord("/uri-doesnt-exist.json")
  throw Error("Expected 404 because a document with the given URI doesn't exist");
} catch (e) {
  assertions.push(
    test.assertEqual("404", e.data[0]),
    test.assertEqual("Could not find record with URI: /uri-doesnt-exist.json", e.data[1])
  );
}

assertions;
