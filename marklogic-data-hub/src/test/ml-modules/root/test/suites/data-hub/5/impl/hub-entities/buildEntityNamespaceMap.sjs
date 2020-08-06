const test = require("/test/test-helper.xqy");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const models = [
  {
    "info": {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "namespace": "org:book",
        "namespacePrefix": "book"
      },
      "Author": {
        "namespace": "org:author",
        "namespacePrefix": "author"
      },
      "OtherAuthor": {
        "namespace": "org:otherAuthor",
        "namespacePrefix": "author"
      }
    }
  }
];

const uberModel = hent.uberModel(models);
const namespaceMap = hent.buildEntityNamespaceMap(uberModel);

[
  test.assertEqual(2, Object.keys(namespaceMap).length, "Because there are two models that use the same namespace " +
    "prefix, we should only have two entries in the map"),
  test.assertEqual("org:book", namespaceMap["book"]),
  test.assertEqual("org:otherAuthor", namespaceMap["author"], "This should be extremely rare, but in case a user " +
    "defines two entities with the same prefix but different namespaces, then the last one in the model wins")
];
