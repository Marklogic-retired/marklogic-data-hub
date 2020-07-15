const test = require("/test/test-helper.xqy");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

function generateElementRangeIndexConfig(entityDefinitionArray) {
  return hent.dumpIndexes(entityDefinitionArray).toObject()["range-element-index"];
}

function generateRangeIndexConfig(entityDefinitionArray) {
  return hent.dumpIndexes(entityDefinitionArray).toObject()["range-path-index"];
}

function sharedPropertyWithNullNamespace() {
  const indexes = generateElementRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "info": {
        "title": "Movie"
      },
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
  const indexes = generateElementRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "namespace": "example",
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "info": {
        "title": "Movie"
      },
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
  const indexes = generateElementRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "elementRangeIndex": ["title"],
          "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
        }
      }
    }, {
      "info": {
        "title": "Movie"
      },
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
  const indexes = generateElementRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "elementRangeIndex": ["author"],
          "properties": {"author": {"datatype": "string", "collation": "http://marklogic.com/collation/"}}
        }
      }
    }, {
      "info": {
        "title": "Movie"
      },
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

function generateIndexConfigForFacetableProperties() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "properties": {
            "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"},
            "authors": {"datatype": "array", "facetable": true, "items": {"datatype": "string"}},
            "rating": {"datatype": "integer", "facetable": true, "items": {"datatype": "string"}},
            "id": {"datatype": "string", "facetable": false, "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }, {
      "info": {
        "title": "Movie"
      },
      "definitions": {
        "Movie": {
          "properties": {"director": {"datatype": "string", "collation": "http://marklogic.com/collation/"}}
        }
      }
    }
  ]);
  return [
    test.assertEqual(3, indexes.length),
    test.assertEqual("//*:instance/Book/title", indexes[0]["path-expression"]),
    test.assertEqual("//*:instance/Book/authors", indexes[1]["path-expression"]),
    test.assertEqual("//*:instance/Book/rating", indexes[2]["path-expression"])
  ];
}

function generateIndexConfigForMissingModelDefinition() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Test": {
          "properties": {
            "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"},
          }
        }
      }
    }
  ]);
  return [
    test.assertEqual(undefined, indexes)
  ];
}

function generateIndexConfigWithNoEntityTypeProperties() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "properties": {

          }
        }
      }
    }
  ]);
  return [
    test.assertEqual(undefined, indexes)
  ];
}

function generateIndexConfigWithStructuredProperties() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "properties": {
            "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"},
            "authors": {"datatype": "array", "facetable": true, "items": {"datatype": "string"}},
            "rating": {"datatype": "integer", "facetable": true, "items": {"datatype": "string"}},
            "id": {"datatype": "string", "facetable": false, "collation": "http://marklogic.com/collation/"},
            "customer": {"datatype": "array", "items": {"$ref": "#/definitions/Address"}, "facetable": true},
            "address": {"$ref": "#/definitions/Address", "facetable": true}
          }
        }
      }
    }
  ]);
  return [
    test.assertEqual(3, indexes.length),
    test.assertEqual("//*:instance/Book/title", indexes[0]["path-expression"]),
    test.assertEqual("//*:instance/Book/authors", indexes[1]["path-expression"]),
    test.assertEqual("//*:instance/Book/rating", indexes[2]["path-expression"])
  ];
}

[]
  .concat(sharedPropertyWithNullNamespace())
  .concat(sharedPropertyWithSameNamespaces())
  .concat(sharedPropertyWithDifferentCollations())
  .concat(differentPropertyNames())
  .concat(generateIndexConfigForFacetableProperties())
  .concat(generateIndexConfigForMissingModelDefinition())
  .concat(generateIndexConfigWithNoEntityTypeProperties()
  .concat(generateIndexConfigWithStructuredProperties()));
