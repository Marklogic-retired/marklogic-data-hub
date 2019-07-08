const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/data-hub/5/smart-mastering/matching/lib/lib.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

const actual = matcher.getOptionsAsJson(lib['MATCH-OPTIONS-NAME']);

[].concat(
  test.assertEqual("200", actual.options.tuning.maxScan.toString()),
  test.assertEqual(7, actual.options.propertyDefs.properties.length),
  test.assertEqual(2, actual.options.algorithms.length)
)
