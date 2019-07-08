/*
 * Ensure that the zip algorithm's options make the JSON->XML->JSON round trip correctly.
 */

const test = require('/test/test-helper.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

let expected = test.getTestFile("match-options.json").root;

let actual = matcher.getOptionsAsJson('match-options');
xdmp.log(`expected: ${xdmp.describe(expected.toObject(), Sequence.from([]), Sequence.from([]))},actual: ${xdmp.describe(actual.toObject(), Sequence.from([]), Sequence.from([]))}`);

test.assertTrue(fn.deepEqual(expected, actual));
