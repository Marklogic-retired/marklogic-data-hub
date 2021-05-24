const test = require("/test/test-helper.xqy");

const assertions = [];

const references = fn.head(xdmp.invoke(
  "/data-hub/5/data-services/mapping/getReferences.sjs",
  {"stepName": "mappingStep1"}
));

assertions.push(
  test.assertEqual("$NAMES", references[0].name),
  test.assertEqual("Something goes here", references[0].description),
  test.assertEqual("$STATUSES", references[1].name),
  test.assertEqual(null, references[1].description),
  test.assertEqual("$URI", references[2].name),
  test.assertEqual("The URI of the source document", references[2].description)
);

assertions;
