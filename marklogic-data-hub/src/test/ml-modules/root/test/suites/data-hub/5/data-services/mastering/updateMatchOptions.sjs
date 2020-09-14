const test = require("/test/test-helper.xqy");

function invokeService(options) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mastering/updateMatchOptions.sjs",
    {"options": options}
  ));
}

// -----------------------------------------------
// matchType exact
// -----------------------------------------------
const exactInput =
  {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [
        {
          "localname": "localnameForName",
          "name": "name"
        }
      ]
    },
    "scoring": {
      "add": [
        {
          "propertyName": "name",
          "weight": "3.5"
        }
      ]
    }
  };
const exactExpected =
  {
    "matchRulesets": [
      {
        "name": "name - Exact",
        "weight": 3.5,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "exact",
            "options": {}
          }
        ]
      }
    ],
    "thresholds": []
  };

// -----------------------------------------------
// matchType zip
// -----------------------------------------------
const zipInput =
  {
    "propertyDefs": {
      "property": [
        {
          "namespace": "",
          "localname": "LocationPostalCode",
          "name": "zip"
        }
      ]
    },
    "scoring": {
      "expand": [
        {
          "propertyName": "zip",
          "algorithmRef": "zip-match",
          "zip": [
            {
              "origin": "5",
              "weight": "1.5"
            },
            {
              "origin": "9",
              "weight": "1"
            }
          ]
        }
      ]
    }
  };
const zipExpected =
  {
    "matchRulesets": [
      {
        "name": "zip - Zip",
        "weight": 1.5,
        "matchRules": [
          {
            "entityPropertyPath": "LocationPostalCode",
            "matchType": "zip",
            "options": {}
          }
        ]
      }
    ],
    "thresholds": []
  };

// -----------------------------------------------
// normalize weights, 2 inputs with neg and pos weights, same output
// -----------------------------------------------
const normNegInput =
  {
    "propertyDefs": {
      "property": [
        {
          "localname": "localnameForName",
          "name": "name"
        }
      ]
    },
    "scoring": {
      "add": [
        {
          "propertyName": "name",
          "weight": "3.5"
        }
      ],
      "reduce": [
        {
          "propertyName": "name",
          "weight": "-20"
        }
      ]
    }
  };
const normPosInput =
  {
    "propertyDefs": {
      "property": [
        {
          "localname": "localnameForName",
          "name": "name"
        }
      ]
    },
    "scoring": {
      "add": [
        {
          "propertyName": "name",
          "weight": "3.5"
        }
      ],
      "reduce": [
        {
          "propertyName": "name",
          "weight": "-20"
        }
      ]
    }
  };
const normExpected =
  {
    "matchRulesets": [
      {
        "name": "name - Exact",
        "weight": 2.8,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "exact",
            "options": {}
          }
        ]
      },
      {
        "name": "name - Reduce",
        "weight": 16,
        "reduce": true,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "exact",
            "options": {}
          }
        ]
      }
    ],
    "thresholds": []
  };

// -----------------------------------------------
// reduce/allMatch scenario
// -----------------------------------------------
const reduceAllMatchInput =
  {
    "propertyDefs": {
      "property": [
        {
          "namespace": "",
          "localname": "lastName",
          "name": "lastName"
        },
        {
          "namespace": "",
          "localname": "address",
          "name": "address"
        }
      ]
    },
    "scoring": {
      "reduce": [
        {
          "allMatch": {
            "property": [ "address", "lastName" ]
          },
          "algorithmRef": "standard-reduction",
          "weight": "5"
        }
      ]
    }
  };
const reduceAllMatchExpected =
  {
    "matchRulesets": [
      {
        "name": "address,lastName - Reduce",
        "weight": 5,
        "reduce": true,
        "matchRules": [
          {
            "entityPropertyPath": "address",
            "matchType": "exact",
            "options": {}
          },
          {
            "entityPropertyPath": "lastName",
            "matchType": "exact",
            "options": {}
          }
        ]
      }
    ],
    "thresholds": []
  };

// -----------------------------------------------
// large options, tests most cases
// -----------------------------------------------
const largeInput =
  {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [
        {
          "localname": "localnameForName",
          "name": "name"
        }
      ]
    },
    "algorithms": {
      "algorithm": [
        {
          "name": "custom-name-match",
          "function": "nameMatch",
          "at": "/custom-modules/matching/nameMatch.xqy",
          "namespace": "http://example.org/custom-modules/matching/nameMatch"
        }
      ]
    },
    "collections": {
      "content": []
    },
    "scoring": {
      "add": [
        {
          "propertyName": "name",
          "weight": "3.5"
        }
      ],
      "expand": [
        {
          "propertyName": "name",
          "algorithmRef": "double-metaphone",
          "weight": "2.5",
          "dictionary": "/nameDictionary.json",
          "distanceThreshold": "100"
        },
        {
          "propertyName": "name",
          "algorithmRef": "thesaurus",
          "weight": "4.5",
          "thesaurus": "/thesauri/name-synonyms.xml",
          "filter": "<qualifier>english</qualifier>"
        },
        {
          "propertyName": "name",
          "algorithmRef": "custom-name-match",
          "weight": "5.5"
        }
      ],
      "reduce": [
        {
          "propertyName": "name",
          "weight": "1.5"
        }
      ]
    },
    "actions": {
      "action": [
        {
          "name": "household-action",
          "function": "household-action",
          "namespace": "http://marklogic.com/smart-mastering/action",
          "at": "/custom-modules/matching/custom-action.xqy"
        }
      ]
    },
    "thresholds": {
      "threshold": [
        { "above": "6.5", "label": "similarThreshold", "action": "notify" },
        { "above": "8.5", "label": "household", "action": "household-action" },
        { "above": "12", "label": "sameThreshold", "action": "merge" }
      ]
    },
    "tuning": {
      "maxScan": 200
    }
  };

const largeExpected =
  {
    "matchRulesets": [
      {
        "name": "name - Exact",
        "weight": 3.5,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "exact",
            "options": {}
          }
        ]
      },
      {
        "name": "name - Double Metaphone",
        "weight": 2.5,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "doubleMetaphone",
            "options": {
              "dictionaryURI": "/nameDictionary.json",
              "distanceThreshold": 100
            }
          }
        ]
      },
      {
        "name": "name - Synonym",
        "weight": 4.5,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "synonym",
            "options": {
              "thesaurusURI": "/thesauri/name-synonyms.xml",
              "filter": "<qualifier>english</qualifier>"
            }
          }
        ]
      },
      {
        "name": "name - Custom",
        "weight": 5.5,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "custom",
            "algorithmModuleNamespace": "http://example.org/custom-modules/matching/nameMatch",
            "algorithmModulePath": "/custom-modules/matching/nameMatch.xqy",
            "algorithmFunction": "nameMatch",
            "options": {}
          }
        ]
      },
      {
        "name": "name - Reduce",
        "weight": 1.5,
        "reduce": true,
        "matchRules": [
          {
            "entityPropertyPath": "localnameForName",
            "matchType": "exact",
            "options": {}
          }
        ]
      }
    ],
    "thresholds": [
      {
        "thresholdName": "similarThreshold",
        "action": "notify",
        "score": 6.5
      },
      {
        "thresholdName": "household",
        "action": "household-action",
        "score": 8.5,
        "actionModulePath": "/custom-modules/matching/custom-action.xqy",
        "actionModuleNamespace": "http://marklogic.com/smart-mastering/action",
        "actionModuleFunction": "household-action"
      },
      {
        "thresholdName": "sameThreshold",
        "action": "merge",
        "score": 12
      }
    ] 
  };

[
  test.assertEqualJson(exactExpected, invokeService(exactInput), "matchType exact"),
  test.assertEqualJson(zipExpected, invokeService(zipInput), "matchType zip"),
  test.assertEqualJson(normExpected, invokeService(normNegInput), "normalize weights, negative reduce"),
  test.assertEqualJson(normExpected, invokeService(normPosInput), "normalize weights, positive reduce"),
  test.assertEqualJson(reduceAllMatchExpected, invokeService(reduceAllMatchInput), "reduce allMatch"),
  test.assertEqualJson(largeExpected, invokeService(largeInput), "large options, most cases")
];
