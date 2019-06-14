const test = require("/test/test-helper.xqy");
const extut = require("/data-hub/5/rest-api/lib/extensions-util.xqy");

function verifyTransformModule(transformName, expectedModule) {
  const functionNameThatHasNoImpactOnThisTest = "transform";
  var fn = extut.getExtensionFunction("transform", transformName, functionNameThatHasNoImpactOnThisTest, "javascript");
  return test.assertEqual(expectedModule, xdmp.functionModule(fn));
}

function verifyResourceModule(resourceName, expectedModule) {
  const functionNameThatHasNoImpactOnThisTest = "get";
  var fn = extut.getExtensionFunction("resource", resourceName, functionNameThatHasNoImpactOnThisTest, "javascript");
  return test.assertEqual(expectedModule, xdmp.functionModule(fn));
}

[
  verifyTransformModule("myTransform", "/marklogic.rest.transform/myTransform/assets/transform.sjs"),
  verifyTransformModule("ml:extractContent", "/data-hub/4/transforms/get-content.xqy"),
  verifyTransformModule("ml:runFlow", "/data-hub/5/transforms/run-flow.xqy"),
  verifyResourceModule("myResource", "/marklogic.rest.resource/myResource/assets/resource.sjs"),
  verifyResourceModule("ml:flow", "/data-hub/4/extensions/flow.xqy"),
  verifyResourceModule("ml:flows", "/data-hub/5/extensions/flows.xqy")
];
