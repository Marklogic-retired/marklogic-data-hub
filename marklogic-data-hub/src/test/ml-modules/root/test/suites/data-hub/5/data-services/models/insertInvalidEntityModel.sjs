/*
  Copyright 2012-2019 MarkLogic Corporation

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

const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const test = require("/test/test-helper.xqy");

const model = {
  "info": {
    "title": "BadEntity",
    "version": "0.0.1",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "BadEntity": {
      "properties": {
        "title": ""
      }
    }
  }
};

try {
  entityLib.writeModel(model.info.title, model);
  throw Error("Expected failure because the title property is invalid");
} catch (e) {
  const errorMessage = e.toString();
  test.assertTrue(errorMessage.startsWith("Unable to validate entity model at URI: /entities/BadEntity.entity.json"),
    "Expected the original error to be wrapped with a new error that identifies which entity model failed validation");
}
