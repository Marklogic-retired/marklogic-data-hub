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

const entitySearchLib = require("/data-hub/5/entities/entity-search-lib.sjs");
const test = require("/test/test-helper.xqy");

// This search response has been simplified down to only what we really need for testing
const response = {
  "snippet-format": "snippet",
  "total": 2,
  "results": [
    {
      "index": 1,
      "uri": "/content/jane.json",
    },
    {
      "index": 2,
      "uri": "/content/sally.json",
    }
  ]
};

// This will need to be provided via a transform parameter; we don't want to try to guess it from
// the query or from the results
const entityName = "Customer";

entitySearchLib.addPropertiesToSearchResponse(entityName, response);

console.log(xdmp.toJsonString(response));

const assertions = [
  test.assertEqual(5, response.selectedPropertyNames.length, "There are 6 total simple properties in Customer, but " +
    "we'll only grab the first 5 by default"),
  test.assertEqual("firstProp", response.selectedPropertyNames[0]),
  test.assertEqual("secondProp", response.selectedPropertyNames[1]),
  test.assertEqual("thirdProp", response.selectedPropertyNames[2]),
  test.assertEqual("fourthProp", response.selectedPropertyNames[3]),
  test.assertEqual("fifthProp", response.selectedPropertyNames[4]),

  test.assertEqual(6, response.entityPropertyNames.length),
  test.assertEqual("firstProp", response.entityPropertyNames[0]),
  test.assertEqual("secondProp", response.entityPropertyNames[1]),
  test.assertEqual("thirdProp", response.entityPropertyNames[2]),
  test.assertEqual("fourthProp", response.entityPropertyNames[3]),
  test.assertEqual("fifthProp", response.entityPropertyNames[4]),
  test.assertEqual("sixthProp", response.entityPropertyNames[5])
];

const janeProps = response.results[0].entityProperties;
assertions.push(
  test.assertEqual(1, Object.keys(janeProps).length, "Since jane only has firstProp populated, we're only expecting that value to exist"),
  test.assertEqual("firstValue", janeProps.firstProp)
);

const sallyProps = response.results[1].entityProperties;
assertions.push(
  test.assertEqual(5, Object.keys(sallyProps).length, "Sally has all 6 props populated, but we only want the first 5"),
  test.assertEqual("firstValue", sallyProps.firstProp),
  test.assertEqual("secondValue", sallyProps.secondProp),
  test.assertEqual("thirdValue", sallyProps.thirdProp),
  test.assertEqual("fourthValue", sallyProps.fourthProp),
  test.assertEqual("fifthValue", sallyProps.fifthProp)
);

assertions
