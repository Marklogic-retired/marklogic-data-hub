const test = require("/test/test-helper.xqy");

const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

let uris = []
for (let uri of cts.uriMatch("/content/5*.json")) {
  xdmp.log(uri);
  uris.push(uri);
}

let options = cts.doc("/steps/matching/patientMatch.step.json").root;
xdmp.log(options);
let results = pma.previewMatchingActivity(options, uris, 0);
xdmp.log(results.actionPreview.length);
xdmp.log(results);
[
  test.assertEqual(19, results.actionPreview.length, "There should be 19 matching pairs")
]
