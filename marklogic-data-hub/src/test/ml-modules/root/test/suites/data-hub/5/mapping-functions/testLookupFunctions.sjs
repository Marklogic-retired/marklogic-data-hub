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
[].concat(testMemoryLookup());
