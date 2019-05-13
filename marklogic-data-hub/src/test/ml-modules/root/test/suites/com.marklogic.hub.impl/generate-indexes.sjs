const test = require("/test/test-helper.xqy");
const hent = require("/data-hub/4/impl/hub-entities.xqy");

function generateIndexes(entityDefinitionArray) {
  return hent.dumpIndexes(entityDefinitionArray).toObject()["range-element-index"];
}

function sharedPropertyWithNullNamespace() {
  const indexes = generateIndexes([
    {
      "definitions": {
        "Book": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "definitions": {
        "Movie": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }
  ]);

  return [
    test.assertEqual(1, indexes.length,
      "Should only have one index since the two properties have the same local name, namespace (null), and collation"
    ),
    test.assertEqual("http://marklogic.com/collation/codepoint", indexes[0].collation),
    test.assertEqual("title", indexes[0].localname),
    test.assertEqual("string", indexes[0]["scalar-type"]),
    test.assertEqual("reject", indexes[0]["invalid-values"]),
    test.assertEqual(false, indexes[0]["range-value-positions"]),
    test.assertEqual(null, indexes[0]["namespace-uri"])
  ];
}

function sharedPropertyWithSameNamespaces() {
  const indexes = generateIndexes([
    {
      "definitions": {
        "Book": {
          "namespace": "example",
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "definitions": {
        "Movie": {
          "namespace": "example",
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }
  ]);

  return [
    test.assertEqual(1, indexes.length),
    test.assertEqual("example", indexes[0]["namespace-uri"])
  ];
};

function sharedPropertyWithDifferentCollations() {
  const indexes = generateIndexes([
    {
      "definitions": {
        "Book": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "definitions": {
        "Movie": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/"}}
        }
      }
    }
  ]);

  return [
    test.assertEqual(2, indexes.length,
      "Should have two indexes because the title properties have different collations"
    )
  ];
}

function differentPropertyNames() {
  const indexes = generateIndexes([
    {
      "definitions": {
        "Book": {
          "elementRangeIndex": ["author"],
          "properties": {"author": {"datatype": "string", "collation": "http://marklogic.com/collation/"}}
        }
      }
    }, {
      "definitions": {
        "Movie": {
          "elementRangeIndex": ["director"],
          "properties": {"director": {"datatype": "string", "collation": "http://marklogic.com/collation/"}}
        }
      }
    }
  ]);

  return [
    test.assertEqual(2, indexes.length,
      "Should have two indexes because the property names are different"
    )
  ];
}


[]
  .concat(sharedPropertyWithNullNamespace())
  .concat(sharedPropertyWithSameNamespaces())
  .concat(sharedPropertyWithDifferentCollations())
  .concat(differentPropertyNames())
