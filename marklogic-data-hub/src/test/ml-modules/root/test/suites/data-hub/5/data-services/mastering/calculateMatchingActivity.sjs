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
        "weight": 1,
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
      "scale":
          {
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
                  }]
              }],
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
                  }]
              },
              {
                "rulesetName": "name",
                "weight": 3.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "doubleMetaphone"
                  }]
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
                  }]
              },
              {
                "rulesetName": "lastName",
                "weight": 1.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "custom"
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }]
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
                  }]
              },
              {
                "rulesetName": "name",
                "weight": 3.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "doubleMetaphone"
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }],
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
                  }]
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
                  }]
              },
              {
                "rulesetName": "lastName",
                "weight": 1.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "custom"
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }]
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
                  }]
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
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }],
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
                  }]
              },
              {
                "rulesetName": "lastName",
                "weight": 1.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "custom"
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }],
            [
              {
                "rulesetName": "name",
                "weight": 3.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "doubleMetaphone"
                  }]
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
                  }]
              },
              {
                "rulesetName": "lastName",
                "weight": 1.5,
                "matchRules": [
                  {
                    "entityPropertyPath": "name",
                    "matchAlgorithm": "custom"
                  }]
              },
              {
                "rulesetName": "NOT hairColor",
                "weight": 1,
                "matchRules": [
                  {
                    "entityPropertyPath": "hairColor",
                    "matchAlgorithm": "exact"
                  }]
              }]
          ]
        }]
    }
;

const step2 = {
  "matchRulesets": [
    {
      "name": "customerId - Exact",
      "weight": 12,
      "matchRules": [
        {
          "entityPropertyPath": "customerId",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
    ,
    {
      "name": "name - Exact",
      "weight": 16,
      "matchRules": [
        {
          "entityPropertyPath": "name",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
    ,
    {
      "name": "birthDate - Reduce",
      "weight": 4,
      "reduce": true,
      "matchRules": [
        {
          "entityPropertyPath": "birthDate",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
  ]
  ,
  "thresholds": [
    {
      "thresholdName": "Definitive Match",
      "action": "merge",
      "score": 11
    }
  ]
};

const expected2 = {
  "scale":
      {
        "max": 11,
        "min": 11
      },
  "thresholdActions": [
    {
      "name": "Definitive Match",
      "action": "merge",
      "minimumMatchContributions": [
        [
          {
            "rulesetName": "name - Exact",
            "weight": 16,
            "matchRules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "exact"
              }]
          }],
        [
          {
            "rulesetName": "customerId - Exact",
            "weight": 12,
            "matchRules": [
              {
                "entityPropertyPath": "customerId",
                "matchAlgorithm": "exact"
              }]
          },
          {
            "rulesetName": "NOT birthDate - Reduce",
            "weight": 4,
            "matchRules": [
              {
                "entityPropertyPath": "birthDate",
                "matchAlgorithm": "exact"
              }]
          }]
      ]
    }]
};

const step3 = {
  "matchRulesets": [
    {
      "name": "customerId - Exact",
      "weight": 12,
      "matchRules": [
        {
          "entityPropertyPath": "customerId",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
    ,
    {
      "name": "name - Exact",
      "weight": 16,
      "matchRules": [
        {
          "entityPropertyPath": "name",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
    ,
    {
      "name": "birthDate - Reduce",
      "weight": 4,
      "reduce": true,
      "matchRules": [
        {
          "entityPropertyPath": "birthDate",
          "matchType": "exact",
          "options": {
          }
        }
      ]
    }
  ]
  ,
  "thresholds": [
    {
      "thresholdName": "Definitive Match",
      "action": "merge",
      "score": 11
    },
    {
      "thresholdName": "Definitive Match - testing multiple thresholds with same score",
      "action": "notify",
      "score": 11
    }
  ]
};

const expected3 = {
  "scale":
    {
      "max": 11,
      "min": 11
    },
  "thresholdActions": [
    {
      "name": "Definitive Match",
      "action": "merge",
      "minimumMatchContributions": [
        [
          {
            "rulesetName": "name - Exact",
            "weight": 16,
            "matchRules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "exact"
              }]
          }],
        [
          {
            "rulesetName": "customerId - Exact",
            "weight": 12,
            "matchRules": [
              {
                "entityPropertyPath": "customerId",
                "matchAlgorithm": "exact"
              }]
          },
          {
            "rulesetName": "NOT birthDate - Reduce",
            "weight": 4,
            "matchRules": [
              {
                "entityPropertyPath": "birthDate",
                "matchAlgorithm": "exact"
              }]
          }]
      ]
    },
    {
      "name": "Definitive Match - testing multiple thresholds with same score",
      "action": "notify",
      "minimumMatchContributions": [
        [
          {
            "rulesetName": "name - Exact",
            "weight": 16,
            "matchRules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "exact"
              }]
          }],
        [
          {
            "rulesetName": "customerId - Exact",
            "weight": 12,
            "matchRules": [
              {
                "entityPropertyPath": "customerId",
                "matchAlgorithm": "exact"
              }]
          },
          {
            "rulesetName": "NOT birthDate - Reduce",
            "weight": 4,
            "matchRules": [
              {
                "entityPropertyPath": "birthDate",
                "matchAlgorithm": "exact"
              }]
          }]
      ]
    }]
};

[
  test.assertEqualJson(expected1, cma.calculateMatchingActivity(step1), "most cases"),
  test.assertEqualJson(expected2, cma.calculateMatchingActivity(step2), "use case that hits reduce recursion code"),
  test.assertEqualJson(expected3, cma.calculateMatchingActivity(step3), "use case that has multiple thresholds with the same score")
];
