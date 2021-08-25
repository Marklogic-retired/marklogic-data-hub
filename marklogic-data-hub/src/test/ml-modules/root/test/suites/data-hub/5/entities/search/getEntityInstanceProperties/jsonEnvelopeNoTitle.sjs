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

const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");
const test = require("/test/test-helper.xqy");

let props = entitySearchLib.getEntityInstanceProperties(xdmp.toJSON({
  envelope: {
    instance: {
      info: {
        notTheTitle: "MyEntity"
      },
      MyEntity: {
        someProperty: "someValue"
      }
    }
  }
}));

const assertions = [
  test.assertEqual("someValue", props.someProperty,
    "info/title is missing, but since there's only one other key under 'instance' that is not 'info', DHF " +
    "will assume that that other key refers to the entity instance properties"
  )
];


props = entitySearchLib.getEntityInstanceProperties(xdmp.toJSON({
  envelope: {
    instance: {
      info: {
        notTheTitle: "MyEntity"
      },
      MyEntity: {
        someProperty: "someValue"
      },
      SomeOtherKey: {}
    }
  }
}));

assertions.push(
  test.assertEqual(null, props, "Because info/title is missing and there are 2 or more other keys under 'instance', " +
    "DHF does not know where to find the properties, so null is returned")
);

assertions
