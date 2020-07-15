const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

let input =
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

const params = false;
const options = hent.dumpSearchOptions(input, params);

let assertions = [
  test.assertEqual("limit=25", xs.string(fn.head(options.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option/text()"))),
    "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
  ),
  test.assertExists(options.xpath("/*:values[@name = 'Book']/*:range/*:element[@name = 'title']")),
  test.assertExists(options.xpath("/*:transform-results[@apply = 'empty-snippet']")),
  test.assertNotExists(options.xpath("/*:values[@name = 'Book']/*:range/*:facet-option"),
    "A facet option does not need to be set on the values element")
];

const expParams = true;
let expOptions = hent.dumpSearchOptions(input, expParams);
assertions.concat([
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
]);

input = [{
  "info" : {
    "title": "Book"
  },
  "definitions": {
    "Book": {
      "properties": {
         "title": {"datatype": "string", "facetable": true, "collation": "http://marklogic.com/collation/"},
         "authors": {"datatype": "array", "facetable": true, "items": {"datatype": "string"}},
         "rating": {"datatype": "integer", "facetable": true, "items": {"datatype": "string"}},
         "bookId": {"datatype": "string", "facetable": false, "collation": "http://marklogic.com/collation/"}
       }
    }
  }
}];

expOptions = hent.dumpSearchOptions(input, expParams);

assertions.concat([
  test.assertEqual("limit=25", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'Book.title']/*:range/*:facet-option/text()"))),
      "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
  ),
  test.assertEqual("//*:instance/Book/title", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'Book.title']/*:range/*:path-index/text()")))),
  test.assertEqual("//*:instance/Book/authors", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'Book.authors']/*:range/*:path-index/text()")))),
  test.assertEqual("//*:instance/Book/rating", xs.string(fn.head(expOptions.xpath("/*:constraint[@name = 'Book.rating']/*:range/*:path-index/text()")))),
  test.assertNotExists(expOptions.xpath("/*:constraint[@name = 'Book.bookId']"))
]);