const test = require("/test/test-helper.xqy");

const pma = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

let uris = []
for (let uri of cts.uriMatch("/content/Cust*")) {
  xdmp.log(uri);
  uris.push(uri);
}

let options = cts.doc("/steps/matching/matchCustomers.step.json").root;

let results = pma.previewMatchingActivity(options, uris, 0);
let log = xdmp.log(results.actionPreview.length);

[
  test.assertEqual(7, results.actionPreview.length, "There should be 7 matching pairs")
]
