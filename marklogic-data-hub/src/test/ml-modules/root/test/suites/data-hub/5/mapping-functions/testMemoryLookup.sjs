const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const coreSjs = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

function testMemoryLookup() {
  const dictionary = '{"M": "Man", "W": "Woman", "NB": "Non-Binary", "Number": 3, "AnObject": {"hello":"world"}}';
  return [
    test.assertEqual('Non-Binary', core.memoryLookup('NB', dictionary)),
    test.assertEqual('Woman', core.memoryLookup('W', dictionary)),
    test.assertEqual('Man', core.memoryLookup('m', dictionary)),
    test.assertEqual(3, core.memoryLookup("Number", dictionary)),
    test.assertEqual(null, core.memoryLookup('none', dictionary)),
    test.assertEqual("world", core.memoryLookup('AnObject', dictionary).hello),

    // invalid JSON
    test.assertThrowsError(xdmp.function(xs.QName('core.memoryLookup')), 'val',"{'not valid': ''}", null),

    test.assertEqual('Non-Binary', coreSjs.memoryLookup('NB', dictionary)),
    test.assertEqual('Woman', coreSjs.memoryLookup('W', dictionary)),
    test.assertEqual('Man', coreSjs.memoryLookup('m', dictionary)),
    test.assertEqual(3, coreSjs.memoryLookup("Number", dictionary)),
    test.assertEqual(null, coreSjs.memoryLookup('none', dictionary)),
    test.assertEqual("world", coreSjs.memoryLookup('AnObject', dictionary).hello),

    // invalid JSON
    test.assertThrowsError(xdmp.function(xs.QName('coreSjs.memoryLookup')), 'val',"{'not valid': ''}", null)
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
  const lookup = '{"T": true, "F": false}';
  return [
    test.assertEqual(true, core.memoryLookup('T', lookup)),
    test.assertEqual(false, core.memoryLookup('F', lookup))
  ];
}

[]
  .concat(testMemoryLookup())
  .concat(lookupOfFalseShouldNotLogThatValueWasNotFound());
