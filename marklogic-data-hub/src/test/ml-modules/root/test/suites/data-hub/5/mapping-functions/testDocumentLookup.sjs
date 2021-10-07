const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const coreSjs = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

const uri = "/test/dictionary.json";

const assertions = [
  test.assertEqual("hello world", core.documentLookup("aString", uri)),
  test.assertEqual(3, core.documentLookup("aNumber", uri)),
  test.assertEqual(true, core.documentLookup("aBoolean", uri)),
  test.assertEqual(false, core.documentLookup("anotherBoolean", uri)),

  // case-insensitive tests, though it's not clear if this is desired behavior or a bug
  test.assertEqual("hello world", core.documentLookup("astring", uri)),
  test.assertEqual(3, core.documentLookup("anumber", uri)),
  test.assertEqual(true, core.documentLookup("aboolean", uri)),
  test.assertEqual(false, core.documentLookup("anotherboolean", uri)),

  test.assertEqual("hello world", coreSjs.documentLookup("aString", uri)),
  test.assertEqual(3, coreSjs.documentLookup("aNumber", uri)),
  test.assertEqual(true, coreSjs.documentLookup("aBoolean", uri)),
  test.assertEqual(false, coreSjs.documentLookup("anotherBoolean", uri)),

  // case-insensitive tests, though it's not clear if this is desired behavior or a bug
  test.assertEqual("hello world", coreSjs.documentLookup("astring", uri)),
  test.assertEqual(3, coreSjs.documentLookup("anumber", uri)),
  test.assertEqual(true, coreSjs.documentLookup("aboolean", uri)),
  test.assertEqual(false, coreSjs.documentLookup("anotherboolean", uri))
];

try {
  core.documentLookup('something', 'missing');
  assertions.push(test.assertTrue(false, "Expected an error because the URI doesn't exist"));

  coreSjs.documentLookup('something', 'missing');
  assertions.push(test.assertTrue(false, "Expected an error because the URI doesn't exist"));

} catch (error) {
  // For unknown reasons, the error message has a colon appended to it; might be something about fn:error being called in XQuery
  // and then the error bubbling up into SJS? Don't know.
  assertions.push(
    test.assertEqual("Dictionary not found at 'missing':", error.message)
  );
}

try {
  core.documentLookup('something', '/test/invalidDictionary.json');
  assertions.push(test.assertTrue(false, "Expected an error because the dictionary doesn't contain a JSON object"));

  coreSjs.documentLookup('something', '/test/invalidDictionary.json');
  assertions.push(test.assertTrue(false, "Expected an error because the dictionary doesn't contain a JSON object"));
} catch (error) {
  // Same thing as above; a colon is mysteriously being appended to the error message
  assertions.push(
    test.assertEqual("Dictionary at '/test/invalidDictionary.json' is not a JSON Object:", error.message)
  );
}

assertions;
