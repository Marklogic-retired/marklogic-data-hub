'use strict';


import hubTest from "/test/data-hub-test-helper.mjs";
const test = require("/test/test-helper.xqy");

invokeCreateArtifact("/steps/mapping/MappingFeatureStep.step.json");

let assertions = [
  test.assertTrue(fn.exists(hubTest.getModulesRecord("/steps/mapping/MappingFeatureStep.step.xml")), "mapping xml document should exists in module database")
];

function invokeCreateArtifact(uri) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/triggers.core.artifact/createArtifact.mjs",
      {uri:uri}
  ));
}

assertions;
