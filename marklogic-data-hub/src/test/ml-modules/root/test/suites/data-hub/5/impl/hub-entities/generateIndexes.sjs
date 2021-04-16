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
  const indexes = hent.dumpIndexes([
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
  ]).toObject();

  const pathIndexes = indexes["range-path-index"];
  return [
    test.assertFalse(indexes.hasOwnProperty("range-element-index"), "Since no range element indexes were generated, " + 
      ", there should not be a range-element-index property, as an empty array can remove existing indexes"),
    test.assertEqual(3, pathIndexes.length),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", pathIndexes[0]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", pathIndexes[1]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/rating", pathIndexes[2]["path-expression"])
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
            "title": {
              "datatype": "string",
              "facetable": true,
              "collation": "http://marklogic.com/collation/"
            },
            "authors": {
              "datatype": "array",
              "facetable": true,
              "items": {
                "datatype": "string"
              }
            },
            "rating": {
              "datatype": "integer",
              "facetable": true,
              "items": {
                "datatype": "string"
              }
            },
            "id": {
              "datatype": "string",
              "facetable": false,
              "collation": "http://marklogic.com/collation/"
            },
            "addresses": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Address"
              }
            },
            "address": {
              "$ref": "#/definitions/Address"
            }
          }
        },
        "Address": {
          "properties": {
            "city": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint",
              "facetable": true
            },
            "state": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "zip": {
              "$ref": "#/definitions/Zip"
            }
          }
        },
        "Zip": {
          "properties": {
            "fiveDigit": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint",
              "facetable": true
            },
            "plusFour": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  ]);
  return [
    test.assertEqual(7, indexes.length),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", indexes[0]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", indexes[1]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/rating", indexes[2]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/addresses/Address/city", indexes[3]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/addresses/Address/zip/Zip/fiveDigit", indexes[4]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/address/Address/city", indexes[5]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/address/Address/zip/Zip/fiveDigit", indexes[6]["path-expression"])
  ];
}

function generateIndexConfigWithSortableProperties() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "properties": {
            "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"},
            "authors": {"datatype": "array", "sortable": true, "items": {"datatype": "string"}},
            "rating": {"datatype": "integer", "facetable": true, "sortable": true, "items": {"datatype": "string"}},
            "id": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
            "customer": {"datatype": "array", "items": {"$ref": "#/definitions/Address"}, "sortable": true},
            "address": {"$ref": "#/definitions/Address", "facetable": true}
          }
        },
        "Address": {
          "rangeIndex": [ "street" ],
          "properties": {
            "street": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"},
            "city": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}
          }
        }
      }
    }
  ]);

  return [
    test.assertEqual(4, indexes.length),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Address/street", indexes[0]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", indexes[1]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", indexes[2]["path-expression"]),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/rating", indexes[3]["path-expression"])
  ];
}

function entityDefWithNamespace() {
  const indexes = generateRangeIndexConfig([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "namespace": "org:example",
          "namespacePrefix": "oe",
          "properties": {
            "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }
  ]);

  return [
    test.assertEqual("/es:envelope/es:instance/oe:Book/oe:title", indexes[0]["path-expression"],
      "When the entity def uses a namespace, the path should be explicit in requiring /es:envelope/es:instance, as the " +
      "user is indicating that their entity instances are XML")
  ];
}

function multipleNamespacesButNoIndexes() {
  const indexes = hent.dumpIndexes([
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "namespace": "org:book",
          "namespacePrefix": "book",
          "properties": {
            "title": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        },
        "Author": {
          "namespace": "org:author",
          "namespacePrefix": "author",
          "properties": {
            "name": {"datatype": "string", "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }
  ]);

  const namespaces = indexes.toObject()["path-namespace"];

  const assertions = [
    test.assertEqual(3, namespaces.length, "The es namespace is expected to be provided by the ES function, and " +
      "the two namespaces in the entity model should always be included regardless of whether there are any indexes. " +
      "This is due to a bug in the Manage API - https://bugtrack.marklogic.com/55246 - that prevents indexes with " +
      "namespace prefixes from being removed unless path-namespaces also contains the prefixes.")
  ];

  let foundEs = false;
  let foundBook = false;
  let foundAuthor = false;

  // The order of these doesn't matter, just need to make sure that each is found
  for (var ns of namespaces) {
    if ("es" === ns.prefix) {
      foundEs = true;
      assertions.push(test.assertEqual("http://marklogic.com/entity-services", ns["namespace-uri"]));
    } else if ("book" === ns.prefix) {
      foundBook = true;
      assertions.push(test.assertEqual("org:book", ns["namespace-uri"]));
    } else if ("author" === ns.prefix) {
      foundAuthor = true;
      assertions.push(test.assertEqual("org:author", ns["namespace-uri"]));
    }
  }

  assertions.push(
    test.assertTrue(foundEs),
    test.assertTrue(foundBook),
    test.assertTrue(foundAuthor)
  );
  return assertions;
}

[]
  .concat(sharedPropertyWithNullNamespace())
  .concat(sharedPropertyWithSameNamespaces())
  .concat(sharedPropertyWithDifferentCollations())
  .concat(differentPropertyNames())
  .concat(generateIndexConfigForFacetableProperties())
  .concat(generateIndexConfigForMissingModelDefinition())
  .concat(generateIndexConfigWithNoEntityTypeProperties())
  .concat(generateIndexConfigWithStructuredProperties())
  .concat(generateIndexConfigWithSortableProperties())
  .concat(multipleNamespacesButNoIndexes())
  .concat(entityDefWithNamespace());
