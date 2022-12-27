'use strict';

const test = require("/test/test-helper.xqy");

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const esMappingLib = mjsProxy.requireMjsModule("/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs");
let assertions = [];


let output = esMappingLib.buildMappingXML(cts.doc("/steps/mapping/MapDog.step.json"), []);

assertions.push(test.assertTrue(fn.exists(output)));
output = esMappingLib.buildMappingXML(cts.doc("/steps/mapping/MapCat.step.json"), []);

assertions.push(test.assertTrue(fn.exists(output)));

assertions;
