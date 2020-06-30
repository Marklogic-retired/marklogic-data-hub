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
    test.assertEqual("Customer", response.results[0].entityName),
    test.assertEqual(true, response.results[1].hasOwnProperty("entityName")),
    test.assertEqual(true, response.results[0].hasOwnProperty("createdOn")),
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

[]
  .concat(verifySimpleSelectedPropertiesResults())
  .concat(verifyStructuredFirstLevelSelectedPropertiesResults())
  .concat(verifyStructuredSelectedPropertiesResults())
  .concat(verifyResultsWithoutSelectedProperties())
  .concat(verifyPrimaryKeyWithDefinedEntities())
  .concat(verifyPrimaryKeyWithoutDefinedEntities())
  .concat(verifySimplePropertiesForSingleEntity())
  .concat(verifyPropertiesForAllEntitiesOption())
  .concat(verifyIdentifierWithoutDefinedPrimaryKey());
