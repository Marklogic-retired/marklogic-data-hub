const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/matching/lib/lib.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

const actual = matcher.getOptionsAsJson(lib['MATCH-OPTIONS-NAME']);

[].concat(
  test.assertEqual("200", actual.options.tuning.maxScan.toString()),
  test.assertEqual(7, actual.options.propertyDefs.property.length),
  test.assertEqual(2, actual.options.algorithms.algorithm.length)
)
