const test = require("/test/test-helper.xqy");

const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

let uris = []
for (let uri of cts.uriMatch("/content/5*.json")) {
  uris.push(uri);
}

const options = cts.doc("/steps/matching/patientMatch.step.json").root;
const sourceQuery = xdmp.eval(options.sourceQuery);

let results = pma.previewMatchingActivity(options, sourceQuery, uris, false, 0);

[
  test.assertEqual(19, results.actionPreview.length, "There should be 19 matching pairs")
]
