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

const shippingProperties = [
  {
    "propertyPath": "shipping.street",
    "propertyLabel": "street",
    "datatype": "string",
    "multiple": false
  },
  {
    "propertyPath": "shipping.city",
    "propertyLabel": "city",
    "datatype": "string",
    "multiple": false
  },
  {
    "propertyPath": "shipping.state",
    "propertyLabel": "state",
    "datatype": "string",
    "multiple": false
  },
  {
    "propertyPath": "shipping.zip",
    "propertyLabel": "zip",
    "datatype": "object",
    "multiple": false,
    "properties": [
      {
        "propertyPath": "shipping.zip.fiveDigit",
        "propertyLabel": "fiveDigit",
        "datatype": "string",
        "multiple": false
      },
      {
        "propertyPath": "shipping.zip.plusFour",
        "propertyLabel": "plusFour",
        "datatype": "string",
        "multiple": false
      }
    ]
  }
];

const sallyShippingResults = [
  [
    {
      "propertyPath": "shipping.street",
      "propertyValue": "Whitwell Place"
    },
    {
      "propertyPath": "shipping.city",
      "propertyValue": "Ellerslie"
    },
    {
      "propertyPath": "shipping.state",
      "propertyValue": "Georgia"
    },
    {
      "propertyPath": "shipping.zip",
      "propertyValue": [
        [
          {
            "propertyPath": "shipping.zip.fiveDigit",
            "propertyValue": "52239"
          },
          {
            "propertyPath": "shipping.zip.plusFour",
            "propertyValue": "1718"
          }
        ]
      ]
    }
  ],
  [
    {
      "propertyPath": "shipping.street",
      "propertyValue": "Skyway road"
    },
    {
      "propertyPath": "shipping.city",
      "propertyValue": "San carlos"
    },
    {
      "propertyPath": "shipping.state",
      "propertyValue": "California"
    },
    {
      "propertyPath": "shipping.zip",
      "propertyValue": [
        [
          {
            "propertyPath": "shipping.zip.fiveDigit",
            "propertyValue": "94070"
          },
          {
            "propertyPath": "shipping.zip.plusFour",
            "propertyValue": "1234"
          }
        ]
      ]
    }
  ]
];

const assertions = [
  test.assertEqual(5, response.selectedPropertyDefinitions.length, "There are 6 total simple properties in Customer, but " +
    "we'll only grab the first 5 by default"),
  test.assertEqual("customerId", response.selectedPropertyDefinitions[0].propertyPath),
  test.assertEqual("name", response.selectedPropertyDefinitions[1].propertyPath),
  test.assertEqual("nicknames", response.selectedPropertyDefinitions[2].propertyPath),
  test.assertEqual("shipping", response.selectedPropertyDefinitions[3].propertyPath),
  test.assertEqual(shippingProperties, response.selectedPropertyDefinitions[3].properties),
  test.assertEqual("billing", response.selectedPropertyDefinitions[4].propertyPath),

  test.assertEqual(7, response.entityPropertyDefinitions.length),
  test.assertEqual("customerId", response.entityPropertyDefinitions[0].propertyPath),
  test.assertEqual("name", response.entityPropertyDefinitions[1].propertyPath),
  test.assertEqual("nicknames", response.entityPropertyDefinitions[2].propertyPath),
  test.assertEqual("shipping", response.entityPropertyDefinitions[3].propertyPath),
  test.assertEqual("billing", response.entityPropertyDefinitions[4].propertyPath),
  test.assertEqual("status", response.entityPropertyDefinitions[5].propertyPath),
  test.assertEqual("customerSince", response.entityPropertyDefinitions[6].propertyPath),
];

const janeProps = response.results[0].entityProperties;
assertions.push(
  test.assertEqual(5, Object.keys(janeProps).length, "jane has first five values populated as expected, ever when two are empty"),
  test.assertEqual(101, janeProps[0].propertyValue),
  test.assertEqual("Jane Foster", janeProps[1].propertyValue),
  test.assertEqual(["jane", "foster"], janeProps[2].propertyValue),
  test.assertEqual(0, janeProps[3].propertyValue.length),
  test.assertEqual(0, janeProps[4].propertyValue.length)
);

const sallyProps = response.results[1].entityProperties;
assertions.push(
  test.assertEqual(5, Object.keys(sallyProps).length, "Sally has all 7 props populated, but we only want the first 5"),
  test.assertEqual(101, sallyProps[0].propertyValue),
  test.assertEqual("Sally Hardin", sallyProps[1].propertyValue),
  test.assertEqual(["Sal", "din", "shh"], sallyProps[2].propertyValue),
  test.assertEqual(sallyShippingResults, sallyProps[3].propertyValue)
);

assertions;
