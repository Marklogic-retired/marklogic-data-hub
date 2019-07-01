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

const options = hent.dumpSearchOptions(input);

[
  test.assertEqual("limit=25", xs.string(fn.head(options.xpath("/*:constraint[@name = 'title']/*:range/*:facet-option/text()"))),
    "To avoid displaying large numbers of values in facets in QuickStart, range constraints default to a max of 25 values"
  ),
  test.assertExists(options.xpath("/*:values[@name = 'Book']/*:range/*:element[@name = 'title']")),
  test.assertNotExists(options.xpath("/*:values[@name = 'Book']/*:range/*:facet-option"),
    "A facet option does not need to be set on the values element")
];
