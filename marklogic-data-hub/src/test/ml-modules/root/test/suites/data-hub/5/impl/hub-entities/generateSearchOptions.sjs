const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

function generateOptionsWithElementRangeIndex() {
  const input =
      [{
        "info" : {
          "title": "Book"
        },
        "definitions": {
          "Book": {
            "elementRangeIndex": ["title"],
            "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
          }
        }
      }];
  const options = hent.dumpSearchOptions(input, false);

  return [
    test.assertEqual("limit=25", xs.string(fn.head(options.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option/text()"))),
        "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
    ),
    test.assertExists(options.xpath("/*:values[@name = 'Book']/*:range/*:element[@name = 'title']")),
    test.assertExists(options.xpath("/*:transform-results[@apply = 'empty-snippet']")),
    test.assertNotExists(options.xpath("/*:values[@name = 'Book']/*:range/*:facet-option"),
        "A facet option does not need to be set on the values element")
  ];
}

function generateExplorerOptionsWithElementRangeIndex() {
  const input =
      [{
        "info" : {
          "title": "Book"
        },
        "definitions": {
          "Book": {
            "elementRangeIndex": ["title"],
            "properties": {"title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}
          }
        }
      }];

  const expOptions = hent.dumpSearchOptions(input, true);
  return [
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option[1]/text()"))),
        "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
    ),
    test.assertEqual("frequency-order", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option[2]/text()"))),
        "To sort the facets based on frequency order"
    ),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'Collection']/*:collection/*:facet-option[3]/text()"))),
        "To sort the facets in decreasing order of frequency on search"
    ),
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[1]/text()"))),
        "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
    ),
    test.assertEqual("frequency-order", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[2]/text()"))),
        "To sort the facets based on frequency order"
    ),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[3]/text()"))),
        "To sort the facets in decreasing order of frequency on search"
    ),
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[1]/text()"))),
        "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
    ),
    test.assertEqual("frequency-order", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[2]/text()"))),
        "To sort the facets based on frequency order"
    ),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[3]/text()"))),
        "To sort the facets in decreasing order of frequency on search"
    ),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'createdByJob', @facet = 'false']")),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'createdByJobWord']")),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'createdOnRange', @facet = 'false']")),
    test.assertExists(expOptions.xpath("/*:values[@name = 'Book']/*:range/*:element[@name = 'title']")),
    test.assertNotExists(expOptions.xpath("/*:values[@name = 'Book']/*:range/*:facet-option"),
        "A facet option does not need to be set on the values element"),
    test.assertEqual("/*:envelope/*:headers", xs.string(fn.head(expOptions.xpath("/*:extract-document-data/*:extract-path[2]/text()"))),
        "To see the sourced From, created on and created by information on the search snippet"
    ),
    test.assertExists(expOptions.xpath("/*:transform-results"), "Enabling the snippet information by applying snippet")
  ];
}

function generateExplorerWithFacetableAndSortableProperties() {
  const input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "elementRangeIndex": ["bookId"],
        "properties": {
          "title": {"datatype": "string", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"},
          "authors": {"datatype": "array", "sortable": true, "items": {"datatype": "string"}},
          "rating": {"datatype": "integer", "sortable": true},
          "bookId": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
          "completedDate": {"datatype": "dateTime", "facetable": true},
          "publishedDate": {"datatype": "date", "sortable": true},
          "publishedAtAddress": {"$ref": "#/definitions/Address"}
        }
      },
      "Address": {
        "elementRangeIndex": [ "city" ],
        "rangeIndex": [ "street" ],
        "properties": {
          "street": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"},
          "city": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}
        }
      }
    }
  }];

  const expOptions = hent.dumpSearchOptions(input, true);

  /**
   * Note that 'contains' is used for constraint name expressions, as ML 9 and 10 differ in how they generate constraint names. :(
   */
  return [
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'title')]/*:range/*:facet-option/text()"))),
        "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
    ),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'title')]/*:range/*:path-index/text()")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'authors')]/*:range/*:path-index/text()")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/rating", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'rating')]/*:range/*:path-index/text()")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/completedDate", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'completedDate')]/*:range/*:path-index/text()")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/publishedDate", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'publishedDate')]/*:range/*:path-index/text()")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Address/street", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'street')]/*:range/*:path-index/text()")))),

    test.assertEqual("true", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'title')]/*:range/@facet")))),
    test.assertEqual("false", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'authors')]/*:range/@facet")))),
    test.assertEqual("false", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'rating')]/*:range/@facet")))),
    test.assertEqual("true", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'completedDate')]/*:range/@facet")))),
    test.assertEqual("false", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'publishedDate')]/*:range/@facet")))),
    test.assertEqual("true", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'street')]/*:range/@facet")))),
    test.assertEqual("true", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'city')]/*:range/@facet")))),

    test.assertNotExists(expOptions.xpath("/*:constraint[contains(@name, 'bookId')]/*:range/*:path-index"))
  ];
}

function entityDefWithNamespace() {
  const input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "namespace": "org:example",
        "namespacePrefix": "oex",
        "properties": {
          "title": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
          "rating": {"datatype": "integer", "sortable": true}
        }
      },
      "Author": {
        "namespace": "urn:author",
        "namespacePrefix": "urna",
        "properties": {
          "name": {"datatype": "string"}
        }
      }
    }
  }];

  const expOptions = hent.dumpSearchOptions(input, true);

  const pathNamespaces = expOptions.xpath("/*:operator/*:state[@name = 'Book_ratingAscending']/*:sort-order/*:path-index/namespace::*").toArray();
  const bookNamespaceIndex = pathNamespaces.findIndex(val => val == "org:example");
  const authorNamespaceIndex = pathNamespaces.findIndex(val => val == "urn:author");

  /**
   * Note that 'contains' is used for constraint name expressions, as ML 9 and 10 differ in how they generate constraint names. :(
   */
  return [
    test.assertNotEqual(-1, bookNamespaceIndex, "The book namespace must be declared so that the path expression can use it"),
    test.assertNotEqual(-1, authorNamespaceIndex, "Even though the author namespace isn't used anywhere, it must still be declared on each " +
      "path expression since it's not known when generating search options if it's ever used"),

    test.assertEqual("/es:envelope/es:instance/oex:Book/oex:rating", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'rating')]/*:range/*:path-index/text()")))),
    test.assertEqual("false", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'rating')]/*:range/@facet"))),
      "A range constraint should exist for rating, but since it's only sortable and not facetable, facet should be 'false'"),

    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_ratingDescending']/*:sort-order/@direction")))),
    test.assertEqual("/es:envelope/es:instance/oex:Book/oex:rating", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_ratingDescending']/*:sort-order/*:path-index")))),
    test.assertEqual("ascending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_ratingAscending']/*:sort-order/@direction")))),
    test.assertEqual("/es:envelope/es:instance/oex:Book/oex:rating", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_ratingAscending']/*:sort-order/*:path-index")))),

    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleAscending']"),
      "title is not sortable, so there should not be a sort operator"),
    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleDescending']"))
  ];
}

function verifySortOperatorsForSortableProperties() {
  const input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "elementRangeIndex": ["bookId"],
        "properties": {
          "title": {"datatype": "string", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"},
          "authors": {"datatype": "array", "sortable": true, "items": {"datatype": "string"}},
          "bookId": {"datatype": "string", "collation": "http://marklogic.com/collation/"},
          "completedDate": {"datatype": "dateTime", "facetable": true},
        }
      }
    }
  }];

  const expOptions = hent.dumpSearchOptions(input, true);
  return [
    test.assertEqual("sort", xs.string(fn.head(expOptions.xpath("/*:operator/@name")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_titleDescending']")),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleDescending']/*:sort-order/@direction")))),
    test.assertEqual("xs:string", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleDescending']/*:sort-order/@type")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleDescending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_titleAscending']")),
    test.assertEqual("ascending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleAscending']/*:sort-order/@direction")))),
    test.assertEqual("xs:string", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleAscending']/*:sort-order/@type")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/title", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_titleAscending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_authorsDescending']")),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsDescending']/*:sort-order/@direction")))),
    test.assertEqual("xs:string", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsDescending']/*:sort-order/@type")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsDescending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_authorsAscending']")),
    test.assertEqual("ascending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsAscending']/*:sort-order/@direction")))),
    test.assertEqual("xs:string", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsAscending']/*:sort-order/@type")))),
    test.assertEqual("/(es:envelope|envelope)/(es:instance|instance)/Book/authors", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_authorsAscending']/*:sort-order/*:path-index")))),
    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'bookId']")),
    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'completedDate']"))
  ];
}

function twoEntitiesHaveSameSortablePropertyName() {
  const input = [
    {
      "info": {
        "title": "Book"
      },
      "definitions": {
        "Book": {
          "properties": {
            "title": {"datatype": "string", "sortable": true, "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    },
    {
      "info": {
        "title": "Author"
      },
      "definitions": {
        "Author": {
          "properties": {
            "title": {"datatype": "string", "sortable": true, "collation": "http://marklogic.com/collation/"}
          }
        }
      }
    }
  ];

  const options = hent.dumpSearchOptions(input, true);
  return [
    test.assertExists(options.xpath("/*:operator/*:state[@name = 'Book_titleAscending']"),
      "To ensure that state names are unique, the state name should begin with the entity name, an " +
      "underscore, and then the property name. An underscore seems safe to use because it's more likely " +
      "that a user would have a hyphen in an entity name as opposed to an underscore."),
    test.assertExists(options.xpath("/*:operator/*:state[@name = 'Book_titleDescending']")),
    test.assertExists(options.xpath("/*:operator/*:state[@name = 'Author_titleAscending']")),
    test.assertExists(options.xpath("/*:operator/*:state[@name = 'Author_titleDescending']"))
  ]
}

function verifySortOptionDatatypeWhenEntityPropertyIsUpdated() {
  const assertions = [];
  let input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "properties": {
          "bookId": {"datatype": "integer", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"}
        }
      }
    }
  }];

  let expOptions = hent.dumpSearchOptions(input, true);
  assertions.push(
    test.assertEqual("xs:decimal", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_bookIdDescending']/*:sort-order/@type")))),
    test.assertEqual("xs:decimal", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_bookIdAscending']/*:sort-order/@type"))))
  );

  input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "properties": {
          "bookId": {"datatype": "int", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"}
        }
      }
    }
  }];
  expOptions = hent.dumpSearchOptions(input, true);
  assertions.push(
      test.assertEqual("xs:int", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_bookIdDescending']/*:sort-order/@type")))),
      test.assertEqual("xs:int", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'Book_bookIdAscending']/*:sort-order/@type")))),
      test.assertNotExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_bookIdDescending']/*:sort-order[@type = 'xs:decimal']")),
      test.assertNotExists(expOptions.xpath("/*:operator/*:state[@name = 'Book_bookIdAscending']/*:sort-order[@type = 'xs:decimal']"))
  );
  return assertions;
}

function testHubCentralSupportedDatatypeMappingsForSort() {
  const assertions = [];
  // Logical entity types supported by ES
  assertions.push(
    test.assertEqual("string", hent.getIndexableDatatype("boolean")),
    test.assertEqual("string", hent.getIndexableDatatype("iri")),
    test.assertEqual("int", hent.getIndexableDatatype("byte")),
    test.assertEqual("int", hent.getIndexableDatatype("short")),
    test.assertEqual("unsignedInt", hent.getIndexableDatatype("unsignedShort")),
    test.assertEqual("unsignedInt", hent.getIndexableDatatype("unsignedByte")),
    test.assertEqual("decimal", hent.getIndexableDatatype("integer")),
    test.assertEqual("decimal", hent.getIndexableDatatype("negativeInteger")),
    test.assertEqual("decimal", hent.getIndexableDatatype("nonNegativeInteger")),
    test.assertEqual("decimal", hent.getIndexableDatatype("positiveInteger")),
    test.assertEqual("decimal", hent.getIndexableDatatype("nonPositiveInteger"))
  );

  // actual data types supported by ML
  assertions.push(
    test.assertEqual("string", hent.getIndexableDatatype("string")),
    test.assertEqual("dateTime", hent.getIndexableDatatype("dateTime")),
    test.assertEqual("anyUri", hent.getIndexableDatatype("anyUri")),
    test.assertEqual("decimal", hent.getIndexableDatatype("decimal")),
    test.assertEqual("double", hent.getIndexableDatatype("double")),
    test.assertEqual("float", hent.getIndexableDatatype("float")),
    test.assertEqual("int", hent.getIndexableDatatype("int")),
    test.assertEqual("long", hent.getIndexableDatatype("long")),
    test.assertEqual("unsignedInt", hent.getIndexableDatatype("unsignedInt")),
    test.assertEqual("unsignedLong", hent.getIndexableDatatype("unsignedLong")),
    test.assertEqual("date", hent.getIndexableDatatype("date")),
    test.assertEqual("dayTimeDuration", hent.getIndexableDatatype("dayTimeDuration")),
    test.assertEqual("gMonth", hent.getIndexableDatatype("gMonth")),
    test.assertEqual("gYear", hent.getIndexableDatatype("gYear")),
    test.assertEqual("gYearMonth", hent.getIndexableDatatype("gYearMonth")),
    test.assertEqual("time", hent.getIndexableDatatype("time")),
    test.assertEqual("yearMonthDuration", hent.getIndexableDatatype("yearMonthDuration"))
  );

  return assertions;
}

function generateExplorerOptionsWithoutContainerConstraint() {
  const input =
      [{
        "info": {
          "title": "Book"
        },
        "definitions": {
          "Book": {
            "properties": {
              "publishedAtAddress": {"$ref": "#/definitions/Address"}
            }
          },
          "Address": {
            "properties": {}
          }
        }
      }];
  const options = hent.dumpSearchOptions(input, true);

  let message = "We dont need the ES generated container constraint since Explorer does not need them and it avoids " +
      "conflict with the DH added constraint if the entity type is also named 'Collection'.";
  return [
    test.assertNotExists(options.xpath("/*:constraint[@name = 'Book']/*:container"), message),
    test.assertNotExists(options.xpath("/*:constraint[@name = 'Address']/*:container"), message),
  ];
}

function verifySnippetOptions() {
  let input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "properties": {
          "bookId": {"datatype": "integer", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"}
        }
      }
    }
  }];

  let expOptions = hent.dumpSearchOptions(input, true);
  return [
    test.assertEqual("snippet", xs.string(fn.head(expOptions.xpath("/*:transform-results/@apply")))),
    test.assertEqual("30", xs.string(fn.head(expOptions.xpath("/*:transform-results/*:per-match-tokens")))),
    test.assertEqual("4", xs.string(fn.head(expOptions.xpath("/*:transform-results/*:max-matches")))),
    test.assertEqual("200", xs.string(fn.head(expOptions.xpath("/*:transform-results/*:max-snippet-chars"))))
  ]
}

function verifySourceNameAndSourceTypeOptions() {
  const input = [{
    "info" : {
      "title": "Book"
    },
    "definitions": {
      "Book": {
        "properties": {
          "bookId": {"datatype": "integer", "facetable": true, "sortable": true, "collation": "http://marklogic.com/collation/"}
        }
      }
    }
  }];

  const expOptions = hent.dumpSearchOptions(input, true);
  return [
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'sourceName']")),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'sourceName', @facet = 'true']")),
    test.assertExists(expOptions.xpath("/*:constraint[contains(@name, 'sourceName')]/*:range/*:field[contains(@name, 'datahubSourceName')]")),
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceName')]/*:range/*:facet-option[1]/text()"))),
        "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"),
    test.assertEqual("frequency-order", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceName')]/*:range/*:facet-option[2]/text()")))),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceName')]/*:range/*:facet-option[3]/text()")))),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'sourceType']")),
    test.assertExists(expOptions.xpath("/*:constraint[@name = 'sourceType', @facet = 'true']")),
    test.assertExists(expOptions.xpath("/*:constraint[contains(@name, 'sourceType')]/*:range/*:field[contains(@name, 'datahubSourceType')]")),
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceType')]/*:range/*:facet-option[1]/text()"))),
        "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"),
    test.assertEqual("frequency-order", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceType')]/*:range/*:facet-option[2]/text()")))),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'sourceType')]/*:range/*:facet-option[3]/text()")))),
  ]
}

[]
  .concat(entityDefWithNamespace())
  .concat(generateOptionsWithElementRangeIndex())
  .concat(generateExplorerOptionsWithElementRangeIndex())
  .concat(generateExplorerWithFacetableAndSortableProperties())
  .concat(twoEntitiesHaveSameSortablePropertyName())
  .concat(verifySortOperatorsForSortableProperties())
  .concat(verifySortOptionDatatypeWhenEntityPropertyIsUpdated())
  .concat(testHubCentralSupportedDatatypeMappingsForSort())
  .concat(generateExplorerOptionsWithoutContainerConstraint())
  .concat(verifySnippetOptions())
  .concat(verifySourceNameAndSourceTypeOptions());
