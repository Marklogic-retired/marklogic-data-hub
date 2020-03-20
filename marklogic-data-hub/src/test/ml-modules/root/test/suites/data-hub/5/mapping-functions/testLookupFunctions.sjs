const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

function testMemoryLookup() {
  let dictionaryStr = '{"M": "Man", "W": "Woman", "NB": "Non-Binary"}';
  let dictionaryObj = {"M": "Man", "W": "Woman", "NB": "Non-Binary"};
  return [
    test.assertEqual('Non-Binary', core.memoryLookup('NB', dictionaryStr)),
    test.assertEqual('Woman', core.memoryLookup('W', dictionaryStr)),
    test.assertEqual('Man', core.memoryLookup('m', dictionaryStr)),
    test.assertEqual(null, core.memoryLookup('none', dictionaryStr)),
    test.assertEqual('Non-Binary', core.memoryLookup('NB', dictionaryObj)),
    test.assertEqual('Woman', core.memoryLookup('W', dictionaryObj)),
    test.assertEqual('Man', core.memoryLookup('m', dictionaryObj)),
    test.assertEqual(null, core.memoryLookup('none', dictionaryObj)),
    // invalid JSON
    test.assertThrowsError(xdmp.function(xs.QName('core.memoryLookup')), 'val',"{'not valid': ''}", null)
  ];
}

/**
 * Unfortunately, this can only be verified via manual inspection of ML logging. The goal is that since a lookup value
 * was found - the boolean false - we want to make sure that the following error is not logged:
 *
 * "message":"Lookup value not found for 'F' with dictionary '{T:true, F:false}'"
 *
 * But to verify that, you need to run this test and keep an eye on the ML app server logging to make sure an error with
 * the above message is not logged.
 */
function lookupOfFalseShouldNotLogThatValueWasNotFound() {
  const lookup = {"T": true, "F": false};
  return [
    test.assertEqual(true, core.memoryLookup('T', lookup)),
    test.assertEqual(false, core.memoryLookup('F', lookup))
  ];
}

[]
  .concat(testMemoryLookup())
  .concat(lookupOfFalseShouldNotLogThatValueWasNotFound());
