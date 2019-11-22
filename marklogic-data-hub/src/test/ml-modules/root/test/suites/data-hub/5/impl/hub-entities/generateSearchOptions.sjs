const hent = require("/data-hub/5/impl/hub-entities.xqy");
const test = require("/test/test-helper.xqy");

const input =
  [{
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
const expOtions = hent.dumpSearchOptions(input, expParams);
assertions.concat([
  test.assertEqual("limit=25", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option[1]/text()"))),
    "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
  ),
  test.assertEqual("frequency-order", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option[2]/text()"))),
    "To sort the facets based on frequency order"
  ),
  test.assertEqual("descending", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'Collection']/*:collection/*:facet-option[3]/text()"))),
    "To sort the facets in decreasing order of frequency on search"
  ),
  test.assertEqual("limit=25", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[1]/text()"))),
    "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
  ),
  test.assertEqual("frequency-order", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[2]/text()"))),
    "To sort the facets based on frequency order"
  ),
  test.assertEqual("descending", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdByStep']/*:range/*:facet-option[3]/text()"))),
    "To sort the facets in decreasing order of frequency on search"
  ),
  test.assertEqual("limit=25", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[1]/text()"))),
    "To avoid displaying large numbers of values in facets in Explorer, range constraints default to a max of 25 values"
  ),
  test.assertEqual("frequency-order", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[2]/text()"))),
    "To sort the facets based on frequency order"
  ),
  test.assertEqual("descending", xs.string(fn.head(expOtions.xpath("/*:constraint[@name = 'createdInFlowRange']/*:range/*:facet-option[3]/text()"))),
    "To sort the facets in decreasing order of frequency on search"
  ),
  test.assertExists(expOtions.xpath("/*:constraint[@name = 'createdByJob', @facet = 'false']")),
  test.assertExists(expOtions.xpath("/*:constraint[@name = 'createdByJobWord']")),
  test.assertExists(expOtions.xpath("/*:constraint[@name = 'createdOnRange', @facet = 'false']")),
  test.assertExists(expOtions.xpath("/*:values[@name = 'Book']/*:range/*:element[@name = 'title']")),
  test.assertNotExists(expOtions.xpath("/*:values[@name = 'Book']/*:range/*:facet-option"),
    "A facet option does not need to be set on the values element"),
  test.assertEqual("/*:envelope/*:headers", xs.string(fn.head(expOtions.xpath("/*:extract-document-data/*:extract-path[2]/text()"))),
    "To see the sourced From, created on and created by information on the search snippet"
  ),
  test.assertNotExists(expOtions.xpath("/*:transform-results"), "Enabling the snippet information by disabling empty-snippet")
]);
