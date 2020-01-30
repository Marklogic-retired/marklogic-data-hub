const test = require("/test/test-helper.xqy");

function invokeLinkService(flowName, stepID, artifactType, artifactName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/linkToStepOptions.mjs",
    {flowName, stepID, artifactType, artifactName}
  ));
}

function invokeRemoveLinkService(flowName, stepID, artifactType, artifactName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/removeLinkToStepOptions.mjs",
    {flowName, stepID, artifactType, artifactName}
  ));
}
let result = invokeLinkService('myFlow', 'ingest-test-ingestion', 'loadData', 'csvLoadData');

let assertions = [
  test.assertTrue(fn.exists(result.steps["1"].options.loadData), 'Load data link should exist'),
  test.assertEqual('csvLoadData', result.steps["1"].options.loadData.name, 'Load data link has proper name')
];

result = invokeRemoveLinkService('myFlow', 'ingest-test-ingestion', 'loadData', 'csvLoadData');
assertions.concat([
  test.assertTrue(fn.empty(result.steps["1"].options.loadData), 'Load data link should not longer exist')
]);
