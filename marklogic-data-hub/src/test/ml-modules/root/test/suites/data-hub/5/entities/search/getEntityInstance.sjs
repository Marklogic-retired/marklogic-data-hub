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

const shippingResults = [
  {
    "Address": {
      "street": "Whitwell Place",
      "city": "Ellerslie",
      "state": "Georgia",
      "zip": {
        "Zip": {
          "fiveDigit": "52239",
          "plusFour": "1718"
        }
      }
    }
  },
  {
    "Address": {
      "street": "Skyway road",
      "city": "San carlos",
      "state": "California",
      "zip": {
        "Zip": {
          "fiveDigit": "94070",
          "plusFour": "1234"
        }
      }
    }
  }
];

const billingResults = {
  "Address": {
    "street": "Anna Court",
    "city": "Stewart",
    "state": "Kansas",
    "zip": {
      "Zip": {
        "fiveDigit": "62601",
        "plusFour": "6783"
      }
    }
  }
};

function getInstanceWithoutESInfo() {
  let docUri = "/content/sally.xml";
  const assertions = [];
  let instance = entitySearchLib.getEntityInstance(docUri);
  let results = instance["Customer"];

  assertions.concat([
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Sally Hardin", results["name"]),
    test.assertEqual(shippingResults, results["shipping"]),
    test.assertEqual(["Sal", "din", "shh"], results["nicknames"]),
    test.assertEqual(JSON.stringify(billingResults), JSON.stringify(results["billing"])),
  ]);

  docUri = "/content/sally.json";
  instance = entitySearchLib.getEntityInstance(docUri);
  results = instance["Customer"];
  assertions.concat([
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Sally Hardin", results["name"]),
    test.assertEqual(shippingResults, results["shipping"]),
    test.assertEqual(["Sal", "din", "shh"], results["nicknames"]),
    test.assertEqual(JSON.stringify(billingResults), JSON.stringify(results["billing"])),
  ]);
  return assertions;
}

function getInstanceWithESInfo() {
  let docUri = "/content/jane.xml";
  const assertions = [];
  let instance = entitySearchLib.getEntityInstance(docUri);
  let results = instance["Customer"];
  assertions.concat([
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Jane Foster", results["name"]),
    test.assertEqual(["jane", "foster"], results["nicknames"])
  ]);

  docUri = "/content/jane.json";
  instance = entitySearchLib.getEntityInstance(docUri);
  results = instance["Customer"];
  assertions.concat([
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Jane Foster", results["name"]),
    test.assertEqual(["jane", "foster"], results["nicknames"])
  ]);

  return assertions;
}

function getInstanceWithAdditionalProperty() {
  let docUri = "/content/instanceWithAdditionalProperty.xml";
  const instance = entitySearchLib.getEntityInstance(docUri);
  const results = instance["Customer"];
  return [
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Jane Foster", results["name"]),
    test.assertEqual(["jane", "foster"], results["nicknames"]),
    test.assertEqual(2000, results["birthYear"])
  ];
}

function getInstanceWithNonExistentModel() {
  let docUri = "/content/instanceWithNonExistentModel.xml";
  const instance = entitySearchLib.getEntityInstance(docUri);
  const results = instance["TestEntity"];
  return [
    test.assertEqual(101, results["testPropertyId"]),
    test.assertEqual("Jane Foster", results["testPropertyName"])
  ];
}

function getInstanceWithNamespace() {
  let docUri = "/content/instanceWithNamespace.xml";
  const instance = entitySearchLib.getEntityInstance(docUri);
  const results = instance["Customer"];
  return [
    test.assertEqual(101, results["customerId"]),
    test.assertEqual("Sally Hardin", results["name"]),
    test.assertEqual(["Sal", "din", "shh"], results["nicknames"])
  ];
}

function getInstanceWithNonExistingDocUri() {
    let docUri = "/content/someURI.xml";
    const instance = entitySearchLib.getEntityInstance(docUri);
    return [
      test.assertEqual(null, instance)
    ]
}

function getInstanceFromTextDocument() {
  let docUri = "/content/textdoc.txt";
  const instance = entitySearchLib.getEntityInstance(docUri);
  return [
    test.assertEqual(null, instance)
  ]
}

[]
    .concat(getInstanceWithoutESInfo())
    .concat(getInstanceWithESInfo())
    .concat(getInstanceWithAdditionalProperty())
    .concat(getInstanceWithNonExistentModel())
    .concat(getInstanceWithNamespace())
    .concat(getInstanceWithNonExistingDocUri())
    .concat(getInstanceFromTextDocument());



