/**
 Copyright (c) 2020 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

const test = require("/test/test-helper.xqy");
const writeLib = require('/marklogic-data-hub-spark-connector/writeLib.sjs');

const propertyName = "firstName";

// The template doesn't matter here, it's only used for producing a nicer error message
const uriTemplate = "doesnt-matter";

const assertions = [
  test.assertEqual("Jane", writeLib.convertPropertyValueToString({firstName: "Jane"}, propertyName, uriTemplate)),
  test.assertEqual("3", writeLib.convertPropertyValueToString({firstName: 3}, propertyName, uriTemplate))
];

try {
  writeLib.convertPropertyValueToString({lastName: "Jane"}, propertyName, uriTemplate);
  throw Error("Expected exception because firstName is undefined");
} catch (e) {
  assertions.push(test.assertEqual("Property 'firstName' is undefined, but is required by uriTemplate: doesnt-matter", e.message));
}

try {
  writeLib.convertPropertyValueToString({firstName: null}, propertyName, uriTemplate);
  throw Error("Expected exception because firstName is null");
} catch (e) {
  assertions.push(test.assertEqual("Property 'firstName' is null, but is required by uriTemplate: doesnt-matter", e.message));
}

try {
  writeLib.convertPropertyValueToString({firstName: {"hello": "world"}}, propertyName, uriTemplate);
  throw Error("Expected exception because firstName is an object");
} catch (e) {
  assertions.push(test.assertEqual("Property 'firstName' is an object, but must be a scalar value as it is used in uriTemplate: doesnt-matter", e.message));
}

try {
  writeLib.convertPropertyValueToString({firstName: function(){}}, propertyName, uriTemplate);
  throw Error("Expected exception because firstName is a function");
} catch (e) {
  assertions.push(test.assertEqual("Property 'firstName' is a function, but must be a scalar value as it is used in uriTemplate: doesnt-matter", e.message));
}

assertions
