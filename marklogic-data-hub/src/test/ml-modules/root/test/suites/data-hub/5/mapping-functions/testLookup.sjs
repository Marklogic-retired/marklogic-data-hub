const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const coreSjs = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

const object = {
  "aString" : "string",
  "aNumber": 3,
  "aBoolean": true,
  "anObject": {"hello": "world"}
};

const assertions = [
  test.assertEqual("string", core.lookup("aString", object)),
  test.assertEqual(3, core.lookup("aNumber", object)),
  test.assertEqual(true, core.lookup("aBoolean", object)),
  test.assertEqual("world", core.lookup("anObject", object).hello),
  test.assertEqual(null, core.lookup("astring", object),
    "The 5.5 impl of lookup in SJS did not support case-insensitive lookups, so neither does the XQuery impl"),

  test.assertEqual("string", coreSjs.lookup("aString", object)),
  test.assertEqual(3, coreSjs.lookup("aNumber", object)),
  test.assertEqual(true, coreSjs.lookup("aBoolean", object)),
  test.assertEqual("world", coreSjs.lookup("anObject", object).hello),

  test.assertEqual(null, coreSjs.lookup("astring", object),
    "The 5.5 impl of lookup in SJS did not support case-insensitive lookups, so neither does the XQuery impl")
];

assertions;
