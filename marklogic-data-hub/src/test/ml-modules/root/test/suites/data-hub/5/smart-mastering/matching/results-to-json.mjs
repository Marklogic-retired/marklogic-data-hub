
const matcher = require("/com.marklogic.smart-mastering/matcher.xqy");
const constants = require("/com.marklogic.smart-mastering/constants.xqy");
const lib = require("lib/lib.xqy");
const test = require("/test/test-helper.xqy");

let doc = fn.doc(lib.URI2);

let options = matcher.getOptionsAsXml("match-test");

let actualXML = matcher.findDocumentMatchesByOptions(doc, options, 1, 6, true, cts.trueQuery());

let actual = matcher.resultsToJson(actualXML);

[
  // the top-level properties are text nodes, although the values are numeric
  test.assertEqual("2", actual.results.total.toString()),
  test.assertEqual("6", actual.results.pageLength.toString()),
  test.assertEqual("1", actual.results.start.toString()),
  test.assertEqual(2, actual.results.result.length)
]
