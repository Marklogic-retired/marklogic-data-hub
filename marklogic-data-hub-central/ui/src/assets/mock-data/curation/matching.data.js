export const matchingStep = {
  "entityType": "Customer",
  "entityTypeId": "http://example.org/Customer-0.0.1/Customer",
  "artifacts": [
    {
      "name": "matchCustomers",
      "stepDefinitionName": "default-matching",
      "stepDefinitionType": "matching",
      "stepId": "matchCustomers-matching",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
      "description": "",
      "lastUpdated": "2020-09-25T09:40:08.300673-07:00",
      "selectedSource": "collection",
      "sourceQuery": "cts.collectionQuery(['Customer'])",
      "collections": ["matchCustomers"],
      "additionalCollections": [],
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
      "targetFormat": "JSON",
      "permissions": "data-hub-common,read,data-hub-common-writer,update",
      "provenanceGranularityLevel": "fine",
      "interceptors": [],
      "customHook": {},
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
        },
        {
          "name": "MultipleRuleset-Customer",
          "weight": 1,
          "matchRules": [
            {
              "entityPropertyPath": "customerId",
              "matchType": "synonym",
              "options": {
                "filter": "",
                "thesaurusURI": "/thesaurus/uri/input.json"
              }
            }],
          "reduce": true,
          "rulesetType": "multiple"
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
    },
    {
      "name": "matchCustomersEmpty",
      "stepDefinitionName": "default-matching",
      "stepDefinitionType": "matching",
      "stepId": "matchCustomersEmpty-matching",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
      "description": "",
      "lastUpdated": "2020-09-25T09:40:08.300673-07:00",
      "selectedSource": "collection",
      "sourceQuery": "cts.collectionQuery(['Customer'])",
      "collections": ["matchCustomers"],
      "additionalCollections": [],
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
      "targetFormat": "JSON",
      "permissions": "data-hub-common,read,data-hub-common-writer,update",
      "provenanceGranularityLevel": "fine",
      "interceptors": [],
      "customHook": {},
      "matchRulesets": [],
      "thresholds": []
    },
    {
      "name": "matchCustomers123",
      "stepDefinitionName": "default-matching",
      "stepDefinitionType": "matching",
      "stepId": "matchCustomersEmpty-matching",
      "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
      "description": "",
      "lastUpdated": "2020-09-25T09:40:08.300673-07:00",
      "selectedSource": "collection",
      "sourceQuery": "cts.collectionQuery(['Customer'])",
      "collections": ["matchCustomers"],
      "additionalCollections": [],
      "sourceDatabase": "data-hub-FINAL",
      "targetDatabase": "data-hub-FINAL",
      "targetFormat": "JSON",
      "permissions": "data-hub-common,read,data-hub-common-writer,update",
      "provenanceGranularityLevel": "fine",
      "interceptors": [],
      "customHook": {},
      "matchRulesets": [],
      "thresholds": []
    }
  ]
};

export const matchingActivity = {
  "scale": {
    "min": 0,
    "max": 12.0
  },
  "thresholdActions": [
    {
      "name": "sameThreshold",
      "action": "merge",
      "minimumMatchContributions": [
        [
          {
            "rulesetName": "name",
            "weight": "11",
            "rules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "doubleMetaphone"
              }
            ]
          },
          {
            "rulesetName": "lastName",
            "weight": "11",
            "rules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "custom"
              }
            ]
          },
          {
            "rulesetName": "billingAddress",
            "weight": "6.5",
            "rules": [
              {
                "entityPropertyPath": "billing.street",
                "matchAlgorithm": "zip"
              }
            ]
          },
          {
            "rulesetName": "shippingAddress",
            "weight": "2",
            "rules": [
              {
                "entityPropertyPath": "shipping.street",
                "matchAlgorithm": "exact"
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
            "rulesetName": "name",
            "weight": "11",
            "rules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "doubleMetaphone"
              }
            ]
          },
          {
            "rulesetName": "billingAddress",
            "weight": "6.5",
            "rules": [
              {
                "entityPropertyPath": "billing.street",
                "matchAlgorithm": "exact"
              }
            ]
          }
        ],
        [
          {
            "rulesetName": "name",
            "weight": "3.5",
            "rules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "doubleMetaphone"
              }
            ]
          },
          {
            "rulesetName": "lastName",
            "weight": "1.5",
            "rules": [
              {
                "entityPropertyPath": "name",
                "matchAlgorithm": "custom"
              }
            ]
          },
          {
            "rulesetName": "shippingAddress",
            "weight": "2",
            "rules": [
              {
                "entityPropertyPath": "billing.street",
                "matchAlgorithm": "exact"
              }
            ]
          }
        ]
      ]
    }
  ]
};
