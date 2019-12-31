
const test = require("/test/test-helper.xqy");

function invokeService() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/artifacts/getArtifactTypesInfo.mjs",
    {}
  ));
}

function accurateLoadDataArtifactType() {
  const loadDataTypeInfo = invokeService().filter((typeInfo) => typeInfo.type === 'loadData');
  return [
    test.assertEqual(1, loadDataTypeInfo.length, 'should only be one type for loadData'),
    test.assertEqual('/loadData/', loadDataTypeInfo[0].directory),
    test.assertEqual('.loadData.json', loadDataTypeInfo[0].fileExtension)
  ];
}

accurateLoadDataArtifactType();
