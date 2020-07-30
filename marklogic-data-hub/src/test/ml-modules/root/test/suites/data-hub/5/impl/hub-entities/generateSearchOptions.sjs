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
    test.assertNotExists(expOptions.xpath("/*:transform-results"), "Enabling the snippet information by disabling empty-snippet")
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
          "rating": {"datatype": "integer", "sortable": true, "items": {"datatype": "string"}},
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

  return [
    test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'title')]/*:range/*:facet-option/text()"))),
        "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
    ),
    test.assertEqual("//*:instance/Book/title", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'title')]/*:range/*:path-index/text()")))),
    test.assertEqual("//*:instance/Book/authors", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'authors')]/*:range/*:path-index/text()")))),
    test.assertEqual("//*:instance/Book/rating", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'rating')]/*:range/*:path-index/text()")))),
    test.assertEqual("//*:instance/Book/completedDate", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'completedDate')]/*:range/*:path-index/text()")))),
    test.assertEqual("//*:instance/Book/publishedDate", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'publishedDate')]/*:range/*:path-index/text()")))),
    test.assertEqual("//*:instance/Address/street", xs.string(fn.head(expOptions.xpath("/*:constraint[contains(@name, 'street')]/*:range/*:path-index/text()")))),
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
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'titleDescending']")),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'titleDescending']/*:sort-order/@direction")))),
    test.assertEqual("//*:instance/Book/title", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'titleDescending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'titleAscending']")),
    test.assertEqual("ascending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'titleAscending']/*:sort-order/@direction")))),
    test.assertEqual("//*:instance/Book/title", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'titleAscending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'authorsDescending']")),
    test.assertEqual("descending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'authorsDescending']/*:sort-order/@direction")))),
    test.assertEqual("//*:instance/Book/authors", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'authorsDescending']/*:sort-order/*:path-index")))),
    test.assertExists(expOptions.xpath("/*:operator/*:state[@name = 'authorsAscending']")),
    test.assertEqual("ascending", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'authorsAscending']/*:sort-order/@direction")))),
    test.assertEqual("//*:instance/Book/authors", xs.string(fn.head(expOptions.xpath("/*:operator[@name = 'sort']/*:state[@name = 'authorsAscending']/*:sort-order/*:path-index")))),
    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'bookId']")),
    test.assertNotExists(expOptions.xpath("/*:operator[@name = 'completedDate']"))
  ];
}

function verifyReplaceEsNamespace() {
  let propertyPath = "/es:instance/es:entityType/es:value";
  let updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual("/*:instance/*:entityType/*:value", updatedPropertyPath);

  propertyPath = "/es:instance/aes:entityType/es:value";
  updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual("/*:instance/aes:entityType/*:value", updatedPropertyPath);

  propertyPath = "/es1:instance/es:entityType/es3:value";
  updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual("/es1:instance/*:entityType/es3:value", updatedPropertyPath);

  propertyPath = "/es1:instance/es2:entityType/es3:value";
  updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual("/es1:instance/es2:entityType/es3:value", updatedPropertyPath);

  propertyPath = "test";
  updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual("test", updatedPropertyPath);

  propertyPath = "";
  updatedPropertyPath = hent.replaceEsNamespace(propertyPath);
  test.assertEqual(null, updatedPropertyPath);
}

[]
    .concat(generateOptionsWithElementRangeIndex())
    .concat(generateExplorerOptionsWithElementRangeIndex())
    .concat(generateExplorerWithFacetableAndSortableProperties())
    .concat(verifySortOperatorsForSortableProperties())
    .concat(verifyReplaceEsNamespace());