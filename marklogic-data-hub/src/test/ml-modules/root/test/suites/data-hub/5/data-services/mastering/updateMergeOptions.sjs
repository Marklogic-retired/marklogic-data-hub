const test = require("/test/test-helper.xqy");

function invokeService(options) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mastering/updateMergeOptions.sjs",
    {"options": options}
  ));
}

// -----------------------------------------------
// default merge strategy
// -----------------------------------------------
const defInput =
  {
    "mergeStrategies": [
      {
        "algorithmRef": "standard",
        "length": {
          "weight": "2"
        },
        "name": "myFavoriteSource",
        "maxSources": 1,
        "sourceWeights": [
          {
            "source": {
              "name": "favoriteSource",
              "weight": "12"
            }
          },
          {
            "source": {
              "name": "lessFavoriteSource",
              "weight": "10"
            }
          }
        ]
      }
    ],
    "merging": [
      {
        "propertyName": "name",
        "strategy": "myFavoriteSource"
      }
    ],
    "propertyDefs": {
      "properties": [
        {
          "localname": "name",
          "name": "name"
        }
      ]
    }
  };
const defExpected =
  {
    "mergeStrategies": [
      {
        "maxSources": 1,
        "priorityOrder": {
          "lengthWeight": 2,
          "sources": [
            {
              "sourceName": "favoriteSource",
              "weight": 12
            },
            {
              "sourceName": "lessFavoriteSource",
              "weight": 10
            }
          ]
        },
        "strategyName": "myFavoriteSource"
      }
    ],
    "mergeRules": [
      {
        "entityPropertyPath": "name",
        "mergeStrategyName": "myFavoriteSource"
      }
    ]
  };

// -----------------------------------------------
// custom merge strategy
// -----------------------------------------------
const custInput =
  {
    "propertyDefs": {
      "properties": [
        {
          "localname": "addressLocalName",
          "name": "addressName"
        }
      ]
    },
    "algorithms": {
      "custom": [
        {
          "name": "addressAlgorithm",
          "function": "mergeAddress",
          "at": "/custom/merge/strategy.sjs"
        }
      ]
    },
    "mergeStrategies": [
      {
        "name": "customMergeStrategy",
        "algorithmRef": "addressAlgorithm"
      }
    ],
    "merging": [
      {
        "propertyName": "addressName",
        "strategy": "customMergeStrategy"
      }
    ]
  };
const custExpected =
  {
    "mergeStrategies": [
      {
        "strategyName": "customMergeStrategy",
        "mergeModulePath": "/custom/merge/strategy.sjs",
        "mergeModuleFunction": "mergeAddress",
        "options": {}
      }
    ],
    "mergeRules": [
      {
        "entityPropertyPath": "addressLocalName",
        "mergeStrategyName": "customMergeStrategy"
      }
    ]
  };

// -----------------------------------------------
// merge with XPath
// -----------------------------------------------
const xpathInput =
  {
    "propertyDefs": {
      "properties": [
        {
          "path": "/es:envelope/es:headers/timestamp",
          "name": "timestamp"
        }
      ],
      "namespaces": {
        "es": "http://marklogic.com/entity-services"
      }
    },
    "mergeStrategies": [
      {
        "name": "myFavoriteSource",
        "maxSources": 1,
        "maxValues": "1",
        "algorithmRef": "standard",
        "length": {
          "weight": "2"
        },
        "sourceWeights": [
          {
            "source": {
              "name": "favoriteSource",
              "weight": "12"
            }
          },
          {
            "source": {
              "name": "lessFavoriteSource",
              "weight": "10"
            }
          }
        ]
      }
    ],
    "merging": [
      {
        "propertyName": "timestamp",
        "strategy": "myFavoriteSource"
      }
    ]
  };
const xpathExpected =
  {
    "mergeStrategies": [
      {
        "strategyName": "myFavoriteSource",
        "maxSources": 1,
        "maxValues": 1,
        "priorityOrder": {
          "lengthWeight": 2,
          "sources": [
            {
              "sourceName": "favoriteSource",
              "weight": 12
            },
            {
              "sourceName": "lessFavoriteSource",
              "weight": 10
            }
          ]
        }
      }
    ],
    "mergeRules": [
      {
        "namespaces": { "es": "http://marklogic.com/entity-services" },
        "documentXPath": "/es:envelope/es:headers/timestamp",
        "mergeStrategyName": "myFavoriteSource"
      }
    ]
  };


// -----------------------------------------------
// collections
// -----------------------------------------------
const collInput =
  {
    "algorithms": {
      "collections": {
        "onMerge": {
          "remove": {
            "collection": [ "sm-Customer-archived" ]
          },
          "add": {
            "collection": [ "sm-Customer-mastered" ]
          }
        },
        "onArchive": {
          "remove": {
            "collection": [ "sm-Customer-mastered" ]
          },
          "add": {
            "collection": [ "sm-Customer-archived" ]
          }
        },
        "onNoMatch": {
          "remove": {
            "collection": [ "sm-Customer-archived" ]
          },
          "add": {
            "collection": [ "sm-Customer-mastered" ]
          }
        },
        "onNotification": {
          "remove": {
            "collection": []
          },
          "add": {
            "collection": [ "sm-Customer-notification" ]
          }
        }
      }
    }
  };
const collExpected =
  {
    "mergeStrategies": [],
    "mergeRules": [],
    "targetCollections": {
      "onMerge": {
        "add": [ "sm-Customer-mastered" ],
        "remove": [ "sm-Customer-archived" ]
      },
      "onArchive": {
        "add": [ "sm-Customer-archived" ],
        "remove": [ "sm-Customer-mastered" ]
      },
      "onNoMatch": {
        "add": [ "sm-Customer-mastered" ],
        "remove": [ "sm-Customer-archived" ]
      },
      "onNotification": {
        "add": [ "sm-Customer-notification" ],
        "remove": []
      }
    }
  };


// -----------------------------------------------
// last updated location
// -----------------------------------------------
const lastInput =
  {
    "algorithms": {
      "stdAlgorithm": {
        "namespaces": {
          "sm": "http://marklogic.com/smart-mastering",
          "es": "http://marklogic.com/entity-services"
        },
        "timestamp": {
          "path": "/es:envelope/es:headers/sm:sources/sm:source/sm:dateTime"
        }
      }
    }
  };
const lastExpected =
  {
    "mergeStrategies": [],
    "mergeRules": [],
    "lastUpdatedLocation": {
      "namespaces": {
        "es": "http://marklogic.com/entity-services",
        "sm": "http://marklogic.com/smart-mastering"
      },
      "documentXPath": "/es:envelope/es:headers/sm:sources/sm:source/sm:dateTime"
    }
  };

[
  test.assertEqualJson(defExpected, invokeService(defInput), "default merge strategy"),
  test.assertEqualJson(custExpected, invokeService(custInput), "custom merge strategy"),
  test.assertEqualJson(xpathExpected, invokeService(xpathInput), "merge with XPath"),
  test.assertEqualJson(collExpected, invokeService(collInput), "merge collections"),
  test.assertEqualJson(lastExpected, invokeService(lastInput), "last updated location")
];
