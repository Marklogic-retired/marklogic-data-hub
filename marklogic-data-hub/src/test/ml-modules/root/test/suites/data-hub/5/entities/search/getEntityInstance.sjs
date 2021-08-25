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
  let props = getEntityInstancePropertiesForUri(docUri);

  assertions.concat([
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Sally Hardin", props["name"]),
    test.assertEqual(shippingResults, props["shipping"]),
    test.assertEqual(["Sal", "din", "shh"], props["nicknames"]),
    test.assertEqual(JSON.stringify(billingResults), JSON.stringify(props["billing"])),
  ]);

  docUri = "/content/sally.json";
  props = getEntityInstancePropertiesForUri(docUri);
  assertions.concat([
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Sally Hardin", props["name"]),
    test.assertEqual(shippingResults, props["shipping"]),
    test.assertEqual(["Sal", "din", "shh"], props["nicknames"]),
    test.assertEqual(JSON.stringify(billingResults), JSON.stringify(props["billing"])),
  ]);
  return assertions;
}

function getInstanceWithESInfo() {
  let docUri = "/content/jane.xml";
  const assertions = [];
  let props = getEntityInstancePropertiesForUri(docUri);
  assertions.concat([
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Jane Foster", props["name"]),
    test.assertEqual(["jane", "foster"], props["nicknames"])
  ]);

  docUri = "/content/jane.json";
  props = getEntityInstancePropertiesForUri(docUri);
  assertions.concat([
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Jane Foster", props["name"]),
    test.assertEqual(["jane", "foster"], props["nicknames"])
  ]);

  return assertions;
}

function getInstanceWithAdditionalProperty() {
  let docUri = "/content/instanceWithAdditionalProperty.xml";
  const props = getEntityInstancePropertiesForUri(docUri);
  return [
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Jane Foster", props["name"]),
    test.assertEqual(["jane", "foster"], props["nicknames"]),
    test.assertEqual(2000, props["birthYear"])
  ];
}

function getInstanceWithNonExistentModel() {
  let docUri = "/content/instanceWithNonExistentModel.xml";
  const props = getEntityInstancePropertiesForUri(docUri);
  return [
    test.assertEqual(101, props["testPropertyId"]),
    test.assertEqual("Jane Foster", props["testPropertyName"])
  ];
}

function getInstanceWithNamespace() {
  let docUri = "/content/instanceWithNamespace.xml";
  const props = getEntityInstancePropertiesForUri(docUri);
  return [
    test.assertEqual(101, props["customerId"]),
    test.assertEqual("Sally Hardin", props["name"]),
    test.assertEqual(["Sal", "din", "shh"], props["nicknames"])
  ];
}

function getInstanceWithNonExistingDocUri() {
    let docUri = "/content/someURI.xml";
    const props = getEntityInstancePropertiesForUri(docUri);
    return [
      test.assertEqual(null, props)
    ]
}

function getInstanceFromTextDocument() {
  let docUri = "/content/textdoc.txt";
  const props = getEntityInstancePropertiesForUri(docUri);
  return [
    test.assertEqual(null, props)
  ]
}

function getInstanceWithInstanceInDifferentXpath() {
  let docUri = "/content/instanceElementInDifferentXpath.xml";
  let props = getEntityInstancePropertiesForUri(docUri);
  return [test.assertEqual(null, props)];
}

function getEntityInstancePropertiesForUri(docUri) {
  return entitySearchLib.getEntityInstanceProperties(cts.doc(docUri));
}

[]
    .concat(getInstanceWithoutESInfo())
    .concat(getInstanceWithESInfo())
    .concat(getInstanceWithAdditionalProperty())
    .concat(getInstanceWithNonExistentModel())
    .concat(getInstanceWithNamespace())
    .concat(getInstanceWithNonExistingDocUri())
    .concat(getInstanceFromTextDocument())
    .concat(getInstanceWithInstanceInDifferentXpath());
