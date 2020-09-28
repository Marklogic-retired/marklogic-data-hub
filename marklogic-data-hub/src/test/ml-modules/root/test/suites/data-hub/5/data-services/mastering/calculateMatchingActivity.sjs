const test = require("/test/test-helper.xqy");

const cma = require("/data-hub/5/data-services/mastering/calculateMatchingActivityLib.sjs");


const step1 =
  {
    "matchRulesets": [
      {
        "name": "name",
        "weight": 3.5,
        "matchRules": [
          {
            "entityPropertyPath": "name",
            "matchType": "doubleMetaphone",
            "options": {
              "dictionaryURI": "/nameDictionary.json",
              "distanceThreshold": 100
            }
          }
        ]
      },
      {
        "name": "lastName",
        "weight": 1.5,
        "matchRules": [
          {
            "entityPropertyPath": "name",
            "matchType": "custom",
            "algorithmModulePath": "/custom-modules/matching/lastNameMatch.sjs",
            "options": {}
          }
        ]
      },
      {
        "name": "billingAddress",
        "weight": 5,
        "matchRules": [
          {
            "entityPropertyPath": "billing.street",
            "matchType": "exact"
          },
          {
            "entityPropertyPath": "billing.zip.fiveDigit",
            "matchType": "exact"
          }
        ]
      },
      {
        "name": "hairColor",
        "weight": 2,
        "reduce": true,
        "matchRules": [
          {
            "entityPropertyPath": "hairColor",
            "matchType": "exact"
          }
        ]
      },
      {
        "name": "socialSecurityNumber",
        "weight": 13,
        "matchRules": [
          {
            "entityPropertyPath": "ssn",
            "matchType": "exact"
          }
        ]
      },
      {
        "name": "shippingAddress",
        "weight": 2,
        "matchRules": [
          {
            "entityPropertyPath": "shipping.street",
            "matchType": "exact"
          },
          {
            "entityPropertyPath": "shipping.zip.fiveDigit",
            "matchType": "exact"
          }
        ]
      }
    ],
    "thresholds": [
      {
        "thresholdName": "sameThreshold",
        "action": "merge",
        "score": 12
      },
      {
        "thresholdName": "similarThreshold",
        "action": "notify",
        "score": 6.5
      },
      {
        "thresholdName": "household",
        "action": "custom",
        "score": 8.5,
        "actionModulePath": "/custom-modules/matching/householdAction.sjs"
      }
    ]
  }
;

const expected1 =
  {
    "scale": {
      "max": 12,
      "min": 6.5
    },
    "thresholdActions": [
      {
        "name": "sameThreshold",
        "action": "merge",
        "minimumMatchContributions": [
          [
            {
              "rulesetName": "socialSecurityNumber",
              "weight": 13,
              "matchRules": [
                {
                  "entityPropertyPath": "ssn",
                  "matchAlgorithm": "exact"
                }
              ]
            }
          ],
          [
            {
              "rulesetName": "billingAddress",
              "weight": 5,
              "matchRules": [
                {
                  "entityPropertyPath": "billing.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "billing.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "name",
              "weight": 3.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "doubleMetaphone"
                }
              ]
            },
            {
              "rulesetName": "shippingAddress",
              "weight": 2,
              "matchRules": [
                {
                  "entityPropertyPath": "shipping.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "shipping.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "lastName",
              "weight": 1.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "custom"
                }
              ]
            }
          ]
        ]
      },
      {
        "name": "household",
        "action": "custom",
        "minimumMatchContributions": [
          [
            {
              "rulesetName": "billingAddress",
              "weight": 5,
              "matchRules": [
                {
                  "entityPropertyPath": "billing.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "billing.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "name",
              "weight": 3.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "doubleMetaphone"
                }
              ]
            }
          ],
          [
            {
              "rulesetName": "billingAddress",
              "weight": 5,
              "matchRules": [
                {
                  "entityPropertyPath": "billing.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "billing.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "shippingAddress",
              "weight": 2,
              "matchRules": [
                {
                  "entityPropertyPath": "shipping.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "shipping.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "lastName",
              "weight": 1.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "custom"
                }
              ]
            }
          ]
        ]
      },
      {
        "name": "similarThreshold",
        "action": "notify",
        "minimumMatchContributions": [
          [
            {
              "rulesetName": "billingAddress",
              "weight": 5,
              "matchRules": [
                {
                  "entityPropertyPath": "billing.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "billing.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "shippingAddress",
              "weight": 2,
              "matchRules": [
                {
                  "entityPropertyPath": "shipping.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "shipping.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            }
          ],
          [
            {
              "rulesetName": "billingAddress",
              "weight": 5,
              "matchRules": [
                {
                  "entityPropertyPath": "billing.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "billing.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "lastName",
              "weight": 1.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "custom"
                }
              ]
            }
          ],
          [
            {
              "rulesetName": "name",
              "weight": 3.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "doubleMetaphone"
                }
              ]
            },
            {
              "rulesetName": "shippingAddress",
              "weight": 2,
              "matchRules": [
                {
                  "entityPropertyPath": "shipping.street",
                  "matchAlgorithm": "exact"
                },
                {
                  "entityPropertyPath": "shipping.zip.fiveDigit",
                  "matchAlgorithm": "exact"
                }
              ]
            },
            {
              "rulesetName": "lastName",
              "weight": 1.5,
              "matchRules": [
                {
                  "entityPropertyPath": "name",
                  "matchAlgorithm": "custom"
                }
              ]
            }
          ]
        ]
      }
    ]
  }
;

[
  test.assertEqualJson(expected1, cma.calculateMatchingActivity(step1), "most cases")
];
