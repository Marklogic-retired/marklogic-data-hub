const lookup = require('/data-hub/5/mapping-functions/lookupValues.sjs');
const test = require("/test/test-helper.xqy");

function testMemoryLookup() {
  let dictionaryStr = '{"M": "Man", "W": "Woman", "NB": "Non-Binary"}';
  let dictionaryObj = {"M": "Man", "W": "Woman", "NB": "Non-Binary"};
  return [
    test.assertEqual('Non-Binary', lookup.memoryLookup('NB', dictionaryStr)),
    test.assertEqual('Woman', lookup.memoryLookup('W', dictionaryStr)),
    test.assertEqual('Man', lookup.memoryLookup('m', dictionaryStr)),
    test.assertEqual(null, lookup.memoryLookup('none', dictionaryStr)),
    test.assertEqual('Non-Binary', lookup.memoryLookup('NB', dictionaryObj)),
    test.assertEqual('Woman', lookup.memoryLookup('W', dictionaryObj)),
    test.assertEqual('Man', lookup.memoryLookup('m', dictionaryObj)),
    test.assertEqual(null, lookup.memoryLookup('none', dictionaryObj)),
    // invalid JSON
    test.assertThrowsError(xdmp.function(xs.QName('lookup.memoryLookup')), 'val',"{'not valid': ''}", null)
  ];
}
[].concat(testMemoryLookup());
