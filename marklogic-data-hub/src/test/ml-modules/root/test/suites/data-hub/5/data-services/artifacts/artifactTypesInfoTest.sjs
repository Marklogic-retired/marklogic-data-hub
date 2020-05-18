
const test = require("/test/test-helper.xqy");

function invokeService() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/getArtifactTypesInfo.sjs",
    {}
  ));
}

function accurateLoadDataArtifactType() {
  const ingestionTypeInfo = invokeService().filter((typeInfo) => typeInfo.type === 'ingestion');
  return [
    test.assertEqual(1, ingestionTypeInfo.length, 'should only be one type for ingestion'),
    test.assertEqual('/steps/ingestion/', ingestionTypeInfo[0].directory),
    test.assertEqual('.step.json', ingestionTypeInfo[0].fileExtension)
  ];
}

accurateLoadDataArtifactType();
