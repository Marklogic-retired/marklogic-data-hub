/*
*   Ensure that the thesaurus zip algorithm's option make the JSON->XML->JSON round trip correctly.
 */


const test = require('/test/test-helper.xqy');
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

let expected = test.getTestFile("match-options.json").root;
let actual = matcher.getOptionsAsJson('match-options');
test.assertTrue(fn.deepEqual(expected, actual));
