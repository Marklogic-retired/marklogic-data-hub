const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/matching/lib/lib.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

let options = matcher.getOptionsAsJson(lib['MATCH-OPTIONS-NAME']);
let httpOptions = {
  "credentialId": xs.unsignedLong(fn.string(test.DEFAULT_HTTP_OPTIONS.xpath('.//*:credential-id'))),
  "headers": { "Content-Type": "application/json"}
};
let postWithOptionsResponse = test.httpPost(`v1/resources/sm-match?rs:uri=${xdmp.urlEncode(lib.URI1)}&rs:pageLength=6&rs:includeMatches=true`, httpOptions, options);
let actual = fn.head(fn.tail(postWithOptionsResponse)).toObject();
[].concat(
  test.assertEqual("200", fn.string(fn.head(postWithOptionsResponse).xpath('//*:code'))),
  test.assertEqual("2", actual.results.total.toString()),
  test.assertEqual("6", actual.results['page-length'].toString()),
  test.assertEqual("1", actual.results.start.toString()),
  test.assertEqual(2, actual.results.result.length)
)
// Test includesMatches option
actual.results.result.forEach((result) => {
  test.assertTrue(result.matches.length > 0);
});

postWithOptionsResponse = test.httpPost(`v1/resources/sm-match?rs:uri=${xdmp.urlEncode(lib.URI1)}&rs:pageLength=6&rs:includeMatches=false`, httpOptions, options);
actual = fn.head(fn.tail(postWithOptionsResponse)).toObject();
actual.results.result.forEach((result) => {
  test.assertFalse(result.matches && result.matches.length > 0);
});

