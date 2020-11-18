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

function verifySimpleProperty() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "customerId": {
            "datatype": "integer",
            "facetable": true,
            "sortable": true
          }
        }
      }
    }
  };

  const metadata = entitySearchLib.buildPropertyMetadata("", model, "Customer");
  return [
    test.assertEqual(1, metadata.length),
    test.assertEqual("customerId", metadata[0].propertyPath),
    test.assertEqual("customerId", metadata[0].propertyLabel),
    test.assertEqual("integer", metadata[0].datatype),
    test.assertEqual(false, metadata[0].multiple),
    test.assertEqual(true, metadata[0].facetable),
    test.assertEqual(true, metadata[0].sortable)
  ];
}

function verifySimpleArrayProperty() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "nicknames": {
            "datatype": "array",
            "facetable": true,
            "items": {
              "datatype": "string"
            }
          }
        }
      }
    }
  };

  const metadata = entitySearchLib.buildPropertyMetadata("", model, "Customer");
  return [
    test.assertEqual(1, metadata.length),
    test.assertEqual("nicknames", metadata[0].propertyPath),
    test.assertEqual("nicknames", metadata[0].propertyLabel),
    test.assertEqual("string", metadata[0].datatype),
    test.assertEqual(true, metadata[0].multiple),
    test.assertEqual(true, metadata[0].facetable),
    test.assertEqual(undefined, metadata[0].sortable)
  ];
}

function verifyStructuredProperty() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "shipping": {
            "$ref": "#/definitions/Address",
            "facetable": true,
            "sortable": true
          },
        }
      },
      "Address": {
        "properties": {
          "street": {
            "datatype": "array",
            "items": {
              "datatype": "string"
            }
          },
          "city": {
            "datatype": "string"
          }
        }
      }
    }
  };

  const metadata = entitySearchLib.buildPropertyMetadata("", model, "Customer");
  return [
    test.assertEqual(1, metadata.length),
    test.assertEqual("shipping", metadata[0].propertyPath),
    test.assertEqual("shipping", metadata[0].propertyLabel),
    test.assertEqual("object", metadata[0].datatype),
    test.assertEqual(false, metadata[0].multiple),
    test.assertEqual(undefined, metadata[0].facetable),
    test.assertEqual(undefined, metadata[0].sortable),

    test.assertEqual(2, metadata[0].properties.length),

    test.assertEqual("shipping.street", metadata[0].properties[0].propertyPath),
    test.assertEqual("street", metadata[0].properties[0].propertyLabel),
    test.assertEqual("string", metadata[0].properties[0].datatype),
    test.assertEqual(true, metadata[0].properties[0].multiple),

    test.assertEqual("shipping.city", metadata[0].properties[1].propertyPath),
    test.assertEqual("city", metadata[0].properties[1].propertyLabel),
    test.assertEqual("string", metadata[0].properties[1].datatype),
    test.assertEqual(false, metadata[0].properties[1].multiple)
  ];
};

function verifyStructuredArrayProperty() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "shipping": {
            "datatype": "array",
            "facetable": true,
            "sortable": true,
            "items": {
              "$ref": "#/definitions/Address"
            }
          }
        }
      },
      "Address": {
        "properties": {
          "zip": {
            "$ref": "#/definitions/Zip"
          }
        }
      },
      "Zip": {
        "properties": {
          "fiveDigit": {
            "datatype": "integer"
          },
          "plusFour": {
            "datatype": "integer"
          }
        }
      }
    }
  };

  const metadata = entitySearchLib.buildPropertyMetadata("", model, "Customer");

  return [
    test.assertEqual(1, metadata.length),
    test.assertEqual("shipping", metadata[0].propertyPath),
    test.assertEqual("shipping", metadata[0].propertyLabel),
    test.assertEqual("object", metadata[0].datatype),
    test.assertEqual(true, metadata[0].multiple),
    test.assertEqual(undefined, metadata[0].facetable),
    test.assertEqual(undefined, metadata[0].sortable),

    test.assertEqual(1, metadata[0].properties.length),

    test.assertEqual("shipping.zip", metadata[0].properties[0].propertyPath),
    test.assertEqual("zip", metadata[0].properties[0].propertyLabel),
    test.assertEqual("object", metadata[0].properties[0].datatype),
    test.assertEqual(false, metadata[0].properties[0].multiple),
    test.assertEqual(2, metadata[0].properties[0].properties.length),
    test.assertEqual("shipping.zip.fiveDigit", metadata[0].properties[0].properties[0].propertyPath),
    test.assertEqual("fiveDigit", metadata[0].properties[0].properties[0].propertyLabel),
    test.assertEqual("integer", metadata[0].properties[0].properties[0].datatype),
    test.assertEqual(false, metadata[0].properties[0].properties[0].multiple),
    test.assertEqual("shipping.zip.plusFour", metadata[0].properties[0].properties[1].propertyPath),
    test.assertEqual("plusFour", metadata[0].properties[0].properties[1].propertyLabel),
    test.assertEqual("integer", metadata[0].properties[0].properties[1].datatype),
    test.assertEqual(false, metadata[0].properties[0].properties[1].multiple)
  ];
};

function verifySimpleAndRelationshipProperties() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "customerId": {
            "datatype": "integer"
          },
          "order": {
            "$ref": "http://example.org/Order-0.0.1/Order"
          },
          "orderArray": {
            "datatype": "array",
            "items": {
              "$ref": "http://example.org/Order-0.0.1/Order"
            }
          }
        }
      }
    }
  };

  const metadata = entitySearchLib.buildPropertyMetadata("", model, "Customer");
  return [
    test.assertEqual(1, metadata.length, "Relationship properties should be ignored since we don't include their properties in search results"),
    test.assertEqual("customerId", metadata[0].propertyPath),
    test.assertEqual("customerId", metadata[0].propertyLabel),
    test.assertEqual("integer", metadata[0].datatype),
    test.assertEqual(false, metadata[0].multiple)
  ];
}

function badEntityReference() {
  const model = {
    "definitions": {
      "Customer": {
        "properties": {
          "shipping": {
            "$ref": "#/definitions/DoesntExist"
          }
        }
      }
    }
  };

  try {
    entitySearchLib.buildPropertyMetadata("", model, "Customer");
    throw new Error("Should have failed because the shipping ref doesn't point to a valid entity type");
  } catch (e) {
    return [
      test.assertEqual("404", e.data[0]),
      test.assertEqual("Could not build property metadata; could not find entity type with name: DoesntExist", e.data[1])
    ];
  }
}

[]
  .concat(verifySimpleProperty())
  .concat(verifySimpleArrayProperty())
  .concat(verifyStructuredProperty())
  .concat(verifyStructuredArrayProperty())
  .concat(verifySimpleAndRelationshipProperties())
  .concat(badEntityReference());
