'use strict';

const test = require("/test/test-helper.xqy");

const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
let assertions = [];


let output = esMappingLib.buildMappingXML(cts.doc("/steps/mapping/MapDog.step.json"), []);

assertions.push(test.assertTrue(fn.exists(output)));
output = esMappingLib.buildMappingXML(cts.doc("/steps/mapping/MapCat.step.json"), []);

assertions.push(test.assertTrue(fn.exists(output)));

assertions;