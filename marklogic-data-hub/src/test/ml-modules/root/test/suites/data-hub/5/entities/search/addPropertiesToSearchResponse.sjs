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

const entityName = "Customer";

function verifySimpleSelectedPropertiesResults() {
  const response = {
    "snippet-format": "snippet",
    "total": 3,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.json",
      },
      {
        "index": 3,
        "uri": "/content/sally.xml",
      }
    ]
  };
  const selectedProperties = ["name", "nicknames"];
  let janeExpectedResult = [
    {
      "propertyPath": "name",
      "propertyValue": "Jane Foster"
    },
    {
      "propertyPath": "nicknames",
      "propertyValue": [
        "jane",
        "foster"
      ]
    }
  ];

  let sallyExpectedResult = [
    {
      "propertyPath": "name",
      "propertyValue": "Sally Hardin"
    },
    {
      "propertyPath": "nicknames",
      "propertyValue": [
        "Sal",
        "din",
        "shh"
      ]
    }
  ];

  entitySearchLib.addPropertiesToSearchResponse(entityName, response, selectedProperties);
  return[
    test.assertEqual(janeExpectedResult, response.results[0].entityProperties),
    test.assertEqual(sallyExpectedResult, response.results[1].entityProperties),
    test.assertEqual(sallyExpectedResult, response.results[2].entityProperties),
    test.assertEqual(2, response.selectedPropertyDefinitions.length),
    test.assertEqual(7, response.entityPropertyDefinitions.length)
  ];
}

function verifyStructuredFirstLevelSelectedPropertiesResults() {
  const response = {
    "snippet-format": "snippet",
    "total": 3,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.json",
      },
      {
        "index": 3,
        "uri": "/content/sally.xml",
      }
    ]
  };
  const selectedProperties = ["shipping", "billing"];
  const sallyExpectedResult = [
    {
      "propertyPath": "shipping",
      "propertyValue": [
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
      ]
    },
    {
      "propertyPath": "billing",
      "propertyValue": [
        [
          {
            "propertyPath": "billing.street",
            "propertyValue": "Anna Court"
          },
          {
            "propertyPath": "billing.city",
            "propertyValue": "Stewart"
          },
          {
            "propertyPath": "billing.state",
            "propertyValue": "Kansas"
          },
          {
            "propertyPath": "billing.zip",
            "propertyValue": [
              [
                {
                  "propertyPath": "billing.zip.fiveDigit",
                  "propertyValue": "62601"
                },
                {
                  "propertyPath": "billing.zip.plusFour",
                  "propertyValue": "6783"
                }
              ]
            ]
          }
        ]
      ]
    }
  ];

  entitySearchLib.addPropertiesToSearchResponse(entityName, response, selectedProperties);
  return[
    test.assertEqual(sallyExpectedResult, response.results[1].entityProperties),
    test.assertEqual(sallyExpectedResult, response.results[2].entityProperties),
    test.assertEqual(2, response.selectedPropertyDefinitions.length),
    test.assertEqual(7, response.entityPropertyDefinitions.length)
  ];
}

function verifyStructuredSelectedPropertiesResults() {
  const response = {
    "snippet-format": "snippet",
    "total": 3,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.json",
      },
      {
        "index": 3,
        "uri": "/content/sally.xml",
      }
    ]
  };
  const sallyExpectedResult = [
    {
      "propertyPath": "shipping",
      "propertyValue": [
        [
          {
            "propertyPath": "shipping.street",
            "propertyValue": "Whitwell Place"
          },
          {
            "propertyPath": "shipping.zip",
            "propertyValue": [
              [
                {
                  "propertyPath": "shipping.zip.fiveDigit",
                  "propertyValue": "52239"
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
            "propertyPath": "shipping.zip",
            "propertyValue": [
              [
                {
                  "propertyPath": "shipping.zip.fiveDigit",
                  "propertyValue": "94070"
                }
              ]
            ]
          }
        ]
      ]
    },
    {
      "propertyPath": "billing",
      "propertyValue": [
        [
          {
            "propertyPath": "billing.zip",
            "propertyValue": [
              [
                {
                  "propertyPath": "billing.zip.fiveDigit",
                  "propertyValue": "62601"
                }
              ]
            ]
          },
          {
            "propertyPath": "billing.street",
            "propertyValue": "Anna Court"
          }
        ]
      ]
    }
  ];
  const assertions = []
  const selectedProperties = ["shipping.street", "shipping.zip.fiveDigit", "billing.zip.fiveDigit", "billing.street"];
  entitySearchLib.addPropertiesToSearchResponse(entityName, response, selectedProperties);
  assertions.push([
    test.assertEqual(sallyExpectedResult, response.results[1].entityProperties),
    test.assertEqual(sallyExpectedResult, response.results[2].entityProperties),
    test.assertEqual(2, response.selectedPropertyDefinitions.length),
    test.assertEqual(7, response.entityPropertyDefinitions.length)
  ]);

  const selectedMetadata = response.selectedPropertyDefinitions;
  assertions.push([
    test.assertEqual("shipping", selectedMetadata[0].propertyPath),
    test.assertEqual("shipping.street", selectedMetadata[0].properties[0].propertyPath),
    test.assertEqual("shipping.zip", selectedMetadata[0].properties[1].propertyPath),
    test.assertEqual("shipping.zip.fiveDigit", selectedMetadata[0].properties[1].properties[0].propertyPath),
    test.assertEqual("billing", selectedMetadata[1].propertyPath),
    test.assertEqual("billing.zip", selectedMetadata[1].properties[0].propertyPath),
    test.assertEqual("billing.zip.fiveDigit", selectedMetadata[1].properties[0].properties[0].propertyPath),
    test.assertEqual("billing.street", selectedMetadata[1].properties[1].propertyPath)
  ]);
  return assertions;
}

function verifyMergedJsonEntityTypeProperties() {
  const entityName = "Customer";
  const expectedShippingResult = [
    [
      {
        "propertyPath": "shipping.street",
        "propertyValue": [
          "Hanover Place",
          "1800 Tysons Blvd"
        ]
      },
      {
        "propertyPath": "shipping.city",
        "propertyValue": [
          "Marshall",
          "McLean"
        ]
      },
      {
        "propertyPath": "shipping.state",
        "propertyValue": [
          "Oklahoma",
          "Virginia"
        ]
      },
      {
        "propertyPath": "shipping.zip",
        "propertyValue": [
          [
            {
              "propertyPath": "shipping.zip.fiveDigit",
              "propertyValue": [
                "22102",
                "19111"
              ]
            },
            {
              "propertyPath": "shipping.zip.plusFour",
              "propertyValue": [
                "2021",
                "1001"
              ]
            }
          ]
        ]
      }
    ]
  ];
  const expectedBillingResult = [
    [
      {
        "propertyPath": "billing.street",
        "propertyValue": [
          "Sunnyside Avenue"
        ]
      },
      {
        "propertyPath": "billing.city",
        "propertyValue": "Brutus"
      },
      {
        "propertyPath": "billing.state",
        "propertyValue": "Wisconsin"
      },
      {
        "propertyPath": "billing.zip",
        "propertyValue": [
          [
            {
              "propertyPath": "billing.zip.fiveDigit",
              "propertyValue": "30706"
            },
            {
              "propertyPath": "billing.zip.plusFour",
              "propertyValue": "8854"
            }
          ]
        ]
      }
    ]
  ];
  const response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/mergedJsonInstance.json"
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual("customerId", response.results[0].entityProperties[0].propertyPath),
    test.assertEqual(105, response.results[0].entityProperties[0].propertyValue),
    test.assertEqual("name", response.results[0].entityProperties[1].propertyPath),
    test.assertEqual(["Hollan Welles", "Holland Wells"], response.results[0].entityProperties[1].propertyValue),
    test.assertEqual("nicknames", response.results[0].entityProperties[2].propertyPath),
    test.assertEqual([], response.results[0].entityProperties[2].propertyValue),
    test.assertEqual("shipping", response.results[0].entityProperties[3].propertyPath),
    test.assertEqual(expectedShippingResult, response.results[0].entityProperties[3].propertyValue),
    test.assertEqual("billing", response.results[0].entityProperties[4].propertyPath),
    test.assertEqual(expectedBillingResult, response.results[0].entityProperties[4].propertyValue)
  ];
}

function verifyMergedXmlEntityTypeProperties() {
  const entityName = "Person";
  const response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/mergedXmlInstance.xml"
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual("FirstName", response.results[0].entityProperties[0].propertyPath),
    test.assertEqual(["Robert", "Bob"], response.results[0].entityProperties[0].propertyValue),
    test.assertEqual("LastName", response.results[0].entityProperties[1].propertyPath),
    test.assertEqual("Bates", response.results[0].entityProperties[1].propertyValue),
    test.assertEqual("SSN", response.results[0].entityProperties[2].propertyPath),
    test.assertEqual(["333-33-3330", "333-33-3331"], response.results[0].entityProperties[2].propertyValue),
    test.assertEqual("ZipCode", response.results[0].entityProperties[3].propertyPath),
    test.assertEqual("", response.results[0].entityProperties[3].propertyValue),
    test.assertEqual("Address", response.results[0].entityProperties[4].propertyPath),
    test.assertEqual("123 Bates St", response.results[0].entityProperties[4].propertyValue)
  ];
}

function verifyResultsWithoutSelectedProperties() {
  const response = {
    "snippet-format": "snippet",
    "total": 3,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.json",
      },
      {
        "index": 3,
        "uri": "/content/sally.xml",
      }
    ]
  };
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
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual(5, Object.keys(response.results[1].entityProperties).length, "Sally has all 7 props populated, but we only want the first 5"),
    test.assertEqual(101, response.results[1].entityProperties[0].propertyValue),
    test.assertEqual("Sally Hardin", response.results[1].entityProperties[1].propertyValue),
    test.assertEqual(["Sal", "din", "shh"], response.results[1].entityProperties[2].propertyValue),
    test.assertEqual(sallyShippingResults, response.results[1].entityProperties[3].propertyValue),
    test.assertEqual(5, Object.keys(response.results[2].entityProperties).length, "Sally has all 7 props populated, but we only want the first 5"),
    test.assertEqual(101, response.results[2].entityProperties[0].propertyValue),
    test.assertEqual("Sally Hardin", response.results[2].entityProperties[1].propertyValue),
    test.assertEqual(["Sal", "din", "shh"], response.results[2].entityProperties[2].propertyValue),
    test.assertEqual(sallyShippingResults, response.results[2].entityProperties[3].propertyValue),
    test.assertEqual(5, response.selectedPropertyDefinitions.length),
    test.assertEqual(7, response.entityPropertyDefinitions.length)
  ];
}

function verifyOrderOfSelectedProperties() {
  const response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json",
      }
    ]
  };
  const selectedProperties = ["customerId", "nicknames", "shipping", "name", "billing"];
  entitySearchLib.addPropertiesToSearchResponse(entityName, response, selectedProperties);
  const orderedProperties = response.results[0].entityProperties.map(entityProperty => entityProperty.propertyPath);
  return [
      test.assertEqual(selectedProperties, orderedProperties)
  ]
}

function verifyPrimaryKeyWithDefinedEntities() {
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
      },
      {
        "index": 3,
        "uri": "/content/tim.json",
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual(101, response.results[0].primaryKey.propertyValue),
    test.assertEqual("customerId", response.results[0].primaryKey.propertyPath),
    test.assertEqual(101, response.results[1].primaryKey.propertyValue),
    test.assertEqual("customerId", response.results[1].primaryKey.propertyPath),
    test.assertEqual("uri", response.results[2].primaryKey.propertyPath, "primaryKey is an empty string, so use uri"),
    test.assertEqual("/content/tim.json", response.results[2].primaryKey.propertyValue)
  ];
}

function verifyPrimaryKeyWithoutDefinedEntities() {
  const response = {
    "snippet-format": "snippet",
    "total": 2,
    "results": [
      {
        "index": 1,
        "uri": "/content/sallyAddress.json",
      },
      {
        "index": 2,
        "uri": "/content/janeAddress.json",
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual("/content/sallyAddress.json", response.results[0].primaryKey.propertyValue),
    test.assertEqual("uri", response.results[0].primaryKey.propertyPath),
    test.assertEqual("/content/janeAddress.json", response.results[1].primaryKey.propertyValue),
    test.assertEqual("uri", response.results[1].primaryKey.propertyPath)
  ];
}

function verifySimplePropertiesForSingleEntity() {
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
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual(true, response.results[0].hasOwnProperty("entityName")),
    test.assertEqual(true, response.results[0].hasOwnProperty("createdOn")),
    test.assertEqual(true, response.results[0].hasOwnProperty("createdBy")),
    test.assertEqual(true, response.results[0].hasOwnProperty("sources")),
    test.assertEqual("Customer", response.results[0].entityName),
    test.assertEqual(true, response.results[1].hasOwnProperty("entityName")),
    test.assertEqual(true, response.results[1].hasOwnProperty("createdOn")),
    test.assertEqual(true, response.results[1].hasOwnProperty("sources")),
    test.assertEqual("Customer", response.results[1].entityName),
  ];
}

function verifyPropertiesForAllEntitiesOption() {
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
  const entityName = null; //Indicates that user has chosen 'All Entities' option

  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  const allEntitiesProps = response.results[0];
  return([
    test.assertEqual(true, allEntitiesProps.hasOwnProperty('identifier')),
    test.assertEqual(true, allEntitiesProps.hasOwnProperty('primaryKey')),
    test.assertEqual(true, allEntitiesProps.hasOwnProperty('entityName')),
    test.assertEqual(true, allEntitiesProps.hasOwnProperty('createdOn')),
    test.assertEqual(true, allEntitiesProps.hasOwnProperty('createdBy')),
    test.assertEqual("identifier", allEntitiesProps.identifier.propertyPath),
    test.assertEqual(101, allEntitiesProps.identifier.propertyValue),
    test.assertEqual("Customer", allEntitiesProps.entityName)
  ]);
}

function verifyIdentifierWithoutDefinedPrimaryKey() {
  const response = {
    "snippet-format": "snippet",
    "total": 2,
    "results": [
      {
        "index": 1,
        "uri": "/content/sallyAddress.json",
      },
      {
        "index": 2,
        "uri": "/content/janeAddress.json",
      }
    ]
  };
  const entityName = null;  //Indicates that user has chosen 'All Entities' option
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return([
    test.assertEqual("/content/sallyAddress.json", response.results[0].identifier.propertyValue),
    test.assertEqual("identifier", response.results[0].identifier.propertyPath),
    test.assertEqual("uri", response.results[0].primaryKey.propertyPath),
    test.assertEqual("/content/janeAddress.json", response.results[1].identifier.propertyValue),
    test.assertEqual("identifier", response.results[1].identifier.propertyPath),
    test.assertEqual("uri", response.results[1].primaryKey.propertyPath)
  ]);
}

function verifyEntityInstanceResults() {
  const response = {
    "snippet-format": "snippet",
    "total": 8,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.xml",
      },
      {
        "index": 3,
        "uri": "/content/instanceWithAdditionalProperty.xml"
      },
      {
        "index": 4,
        "uri": "/content/instanceWithNonExistentModel.xml"
      },
      {
        "index": 5,
        "uri": "/content/instanceWithNamespace.xml"
      },
      {
        "index": 6,
        "uri": "/content/textdoc.txt"
      },
      {
        "index": 7,
        "uri": "/content/nonExistentDoc.json"
      },
      {
        "index": 8,
        "uri": "/content/mergedJsonInstance.json"
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual(5, Object.keys(response.results[0].entityInstance).length, "Sally has 5 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[0].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[0].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[0].entityInstance.nicknames),
    test.assertEqual(2, response.results[0].entityInstance.shipping.length),
    test.assertEqual(null, response.results[0].entityInstance.birthDate),
    test.assertEqual(null, response.results[0].entityInstance.status),
    // For XML doc result
    test.assertEqual(5, Object.keys(response.results[1].entityInstance).length, "Sally has 5 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[1].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[1].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[1].entityInstance.nicknames),
    test.assertEqual(2, response.results[1].entityInstance.shipping.length),
    test.assertEqual(null, response.results[1].entityInstance.birthDate),
    test.assertEqual(null, response.results[1].entityInstance.status),
    // instanceWithAdditionalProperty
    test.assertEqual(4, Object.keys(response.results[2].entityInstance).length, "4 props are populated. which are available in the xpath /*:envelope/*:instance" +
        "Additional property birthDate is returned. There are only 4 properties in the instance"),
    // instanceWithNonExistentModel
    test.assertEqual(0, Object.keys(response.results[3].entityInstance).length),
    test.assertEqual(0, Object.keys(response.results[3].entityProperties).length),
    // instanceWithNamespace
    test.assertEqual(3, Object.keys(response.results[4].entityInstance).length, "Sally has only 3 props populated. which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[4].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[4].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[4].entityInstance.nicknames),
    test.assertEqual(null, response.results[4].entityInstance.shipping),
    test.assertEqual(null, response.results[4].entityInstance.billing),
    test.assertEqual(null, response.results[4].entityInstance.birthDate),
    test.assertEqual(null, response.results[4].entityInstance.status),
    // textdocument
    test.assertEqual(0, Object.keys(response.results[5].entityInstance).length),
    // nonExistentDoc
    test.assertEqual(0, Object.keys(response.results[6].entityInstance).length),
    // mergedJsonInstance
    test.assertEqual(4, Object.keys(response.results[7].entityInstance).length, "mergedJsonInstance has 5 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(105, response.results[7].entityInstance.customerId),
    test.assertEqual(["Hollan Welles", "Holland Wells"], response.results[7].entityInstance.name),
    test.assertEqual(1, response.results[7].entityInstance.shipping.length),
    test.assertEqual(null, response.results[7].entityInstance.birthDate),
    test.assertEqual(null, response.results[7].entityInstance.status)
  ];
}

function verifyEntityInstanceResultsForAllEntities() {
  //Indicates that user has chosen 'All Entities' option
  const entityName = null;
  const response = {
    "snippet-format": "snippet",
    "total": 9,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.xml",
      },
      {
        "index": 3,
        "uri": "/content/instanceWithAdditionalProperty.xml"
      },
      {
        "index": 4,
        "uri": "/content/instanceWithNonExistentModel.xml"
      },
      {
        "index": 5,
        "uri": "/content/instanceWithNamespace.xml"
      },
      {
        "index": 6,
        "uri": "/content/textdoc.txt"
      },
      {
        "index": 7,
        "uri": "/content/nonExistentDoc.json"
      },
      {
        "index": 8,
        "uri": "/content/mergedJsonInstance.json"
      },
      {
        "index": 9,
        "uri": "/content/mergedXmlInstance.xml"
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual(5, Object.keys(response.results[0].entityInstance).length, "Sally has 5 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[0].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[0].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[0].entityInstance.nicknames),
    test.assertEqual(2, response.results[0].entityInstance.shipping.length),
    test.assertEqual(null, response.results[0].entityInstance.birthDate),
    test.assertEqual(null, response.results[0].entityInstance.status),
    // For XML doc result
    test.assertEqual(5, Object.keys(response.results[1].entityInstance).length, "Sally has 5 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[1].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[1].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[1].entityInstance.nicknames),
    test.assertEqual(2, response.results[1].entityInstance.shipping.length),
    test.assertEqual(null, response.results[1].entityInstance.birthDate),
    test.assertEqual(null, response.results[1].entityInstance.status),
    // instanceWithAdditionalProperty
    test.assertEqual(4, Object.keys(response.results[2].entityInstance).length, "4 props are populated. which are available in the xpath /*:envelope/*:instance" +
        "Additional property birthDate is returned. There are only 4 properties in the instance"),
    // instanceWithNonExistentModel
    test.assertEqual(0, Object.keys(response.results[3].entityInstance).length),
    // instanceWithNamespace
    test.assertEqual(3, Object.keys(response.results[4].entityInstance).length, "Sally has only 3 props populated. which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(101, response.results[4].entityInstance.customerId),
    test.assertEqual("Sally Hardin", response.results[4].entityInstance.name),
    test.assertEqual(["Sal", "din", "shh"], response.results[4].entityInstance.nicknames),
    test.assertEqual(null, response.results[4].entityInstance.shipping),
    test.assertEqual(null, response.results[4].entityInstance.billing),
    test.assertEqual(null, response.results[4].entityInstance.birthDate),
    test.assertEqual(null, response.results[4].entityInstance.status),
    // textdocument
    test.assertEqual(0, Object.keys(response.results[5].entityInstance).length),
    // nonExistentDoc
    test.assertEqual(0, Object.keys(response.results[6].entityInstance).length),
    // mergedJsonInstance
    test.assertEqual(4, Object.keys(response.results[7].entityInstance).length, "mergedJsonInstance has 4 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(105, response.results[7].entityInstance.customerId),
    test.assertEqual(["Hollan Welles", "Holland Wells"], response.results[7].entityInstance.name),
    test.assertEqual(1, response.results[7].entityInstance.shipping.length),
    test.assertEqual(null, response.results[7].entityInstance.birthDate),
    test.assertEqual(null, response.results[7].entityInstance.status),
    // mergedXmlInstance
    test.assertEqual(4, Object.keys(response.results[8].entityInstance).length, "mergedXmlInstance has 4 props populated which are available in the xpath /*:envelope/*:instance"),
    test.assertEqual(["Robert", "Bob"], response.results[8].entityInstance.FirstName),
    test.assertEqual(["333-33-3330", "333-33-3331"], response.results[8].entityInstance.SSN),
    test.assertEqual("Bates", response.results[8].entityInstance.LastName),
    test.assertEqual("123 Bates St", response.results[8].entityInstance.Address)
  ];
}

function verifyEntityNameNotInCollectionFacet() {
  const response = {
    "snippet-format": "snippet",
    "total": 1,
    "results": [
      {
        "index": 1,
        "uri": "/content/jane.json",
      }
    ],
    "facets": {
      "Collection": {
        "type": "collection",
        "facetValues": [
          {
            "name": "Customer",
            "count": 10,
            "value": "Customer"
          },
          {
            "name": "mapCustomersJSON",
            "count": 5,
            "value": "mapCustomersJSON"
          },
          {
            "name": "mapCustomersXML",
            "count": 5,
            "value": "mapCustomersXML"
          }
        ]
      }
    }
  };
  const expectedFacetValues = [
    {
      "name": "mapCustomersJSON",
      "count": 5,
      "value": "mapCustomersJSON"
    },
    {
      "name": "mapCustomersXML",
      "count": 5,
      "value": "mapCustomersXML"
    }
  ];
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  let facetValues = response.facets.Collection.facetValues
  return ([
    test.assertEqual(2, facetValues.length),
    test.assertEqual(expectedFacetValues, facetValues),
  ]);
}

function testEntitySourcesInSearchResponse() {
  let entityName = null;
  const response = {
    "snippet-format": "snippet",
    "total": 4,
    "results": [
      {
        "index": 1,
        "uri": "/content/sally.json",
      },
      {
        "index": 2,
        "uri": "/content/sally.xml",
      },
      {
        "index": 3,
        "uri": "/content/mergedJsonInstance.json"
      },
      {
        "index": 4,
        "uri": "/content/mergedXmlInstance.xml"
      },
      {
        "index": 5,
        "uri": "/content/jane.json"
      }
    ]
  };
  entitySearchLib.addPropertiesToSearchResponse(entityName, response);
  return [
    test.assertEqual([{"name":"loadData"},{"name":"someOtherName"}], response.results[0].sources),
    test.assertEqual([{"name":["loadCustomers","loadCustomersXml"]}], response.results[1].sources),
    test.assertEqual([{"name":"loadCustomersJSON"}], response.results[2].sources),
    test.assertEqual([{"name":"persons"}], response.results[3].sources),
    test.assertEqual([], response.results[4].sources)
  ];
}

[]
  .concat(verifySimpleSelectedPropertiesResults())
  .concat(verifyStructuredFirstLevelSelectedPropertiesResults())
  .concat(verifyStructuredSelectedPropertiesResults())
  .concat(verifyResultsWithoutSelectedProperties())
  .concat(verifyMergedJsonEntityTypeProperties())
  .concat(verifyMergedXmlEntityTypeProperties())
  .concat(verifyOrderOfSelectedProperties())
  .concat(verifyPrimaryKeyWithDefinedEntities())
  .concat(verifyPrimaryKeyWithoutDefinedEntities())
  .concat(verifySimplePropertiesForSingleEntity())
  .concat(verifyPropertiesForAllEntitiesOption())
  .concat(verifyIdentifierWithoutDefinedPrimaryKey())
  .concat(verifyEntityInstanceResults())
  .concat(verifyEntityInstanceResultsForAllEntities())
  .concat(verifyEntityNameNotInCollectionFacet())
  .concat(testEntitySourcesInSearchResponse());
