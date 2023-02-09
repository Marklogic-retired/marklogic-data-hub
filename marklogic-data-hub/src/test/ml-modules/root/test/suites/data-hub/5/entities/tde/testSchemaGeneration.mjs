/**
 Copyright (c) 2021 MarkLogic Corporation

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

function getSchema(uri) {
  return fn.head(xdmp.invokeFunction(() => cts.doc(uri), {database: xdmp.schemaDatabase()}));
}

function verifySchemaGeneration() {
  const customerSchema = getSchema("/entities/Customer.entity.schema.json");
  return [
    test.assertTrue(fn.empty(customerSchema.xpath("/definitions/Customer/properties/billing/properties/Address/type")), "References should have empty types."),
    test.assertEqual("string", fn.string(customerSchema.xpath("/definitions/Customer/properties/nicknames/items/type")), "Arrays should have correct type.")
  ];
}

[].concat(verifySchemaGeneration());
