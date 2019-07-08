xquery version "1.0-ml";

module namespace test-ext = "http://marklogic.com/test/dh/ext";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare function test-ext:assert-equal-tidy-xml($expected, $actual) {
  test-ext:assert-equal-tidy-xml($expected, $actual, ())
};

declare function test-ext:assert-equal-tidy-xml($expected, $actual, $message) {
  test:assert-true(
    fn:deep-equal(
      fn:tail(xdmp:tidy(xdmp:quote($expected), map:entry('inputXml', 'yes'))),
      fn:tail(xdmp:tidy(xdmp:quote($actual), map:entry('inputXml', 'yes')))
    ),
    $message
  )
};
