'use strict';


const test = require("/test/test-helper.xqy");
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const mappingFeature = mjsProxy.requireMjsModule("/data-hub/features/mapping.mjs");

const result1 = mappingFeature.onArtifactSave("mapping", "MappingFeatureStep");
const assertions = [
  test.assertTrue(result1, "executing mapping feature")
];

const resultClean = mappingFeature.onArtifactDelete("mapping", "MappingFeatureStep");
assertions.push(test.assertTrue(resultClean, "clean up mapping xml and compiled xslts"));


assertions;
