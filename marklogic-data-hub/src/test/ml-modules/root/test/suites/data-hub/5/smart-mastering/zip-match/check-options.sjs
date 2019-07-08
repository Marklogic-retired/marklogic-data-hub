/*
 * Ensure that the zip algorithm's options make the JSON->XML->JSON round trip correctly.
 */

const test = require('/test/test-helper.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

let expected = test.getTestFile("match-options.json").root;

let actual = matcher.getOptionsAsJson('match-options');

xdmp.log('check-options. actual=' + xdmp.quote(actual));

test.assertEqualJson(expected, actual);
