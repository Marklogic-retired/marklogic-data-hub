export const mockEntityMapTable = {
  "setScrollRef": () => {},
  "executeScroll": () => {},
  "mapResp": {},
  "mapData": {
    "collections": [
      "mapOfficeStep",
      "Office"
    ],
    "additionalCollections": [],
    "permissions": "data-hub-common,read,data-hub-common,update",
    "batchSize": 100,
    "validateEntity": "doNotValidate",
    "targetFormat": "json",
    "attachSourceDocument": false,
    "sourceRecordScope": "instanceOnly",
    "name": "mapOfficeStep",
    "targetEntityType": "http://example.org/Office-0.0.1/Office",
    "description": "",
    "collection": [
      "loadOffice"
    ],
    "selectedSource": "collection",
    "sourceQuery": "cts.collectionQuery(['loadOffice'])",
    "targetDatabase": "data-hub-FINAL",
    "headers": {},
    "interceptors": [],
    "provenanceGranularityLevel": "off",
    "customHook": {},
    "sourceDatabase": "data-hub-STAGING",
    "stepDefinitionName": "entity-services-mapping",
    "stepDefinitionType": "mapping",
    "stepId": "mapOfficeStep-mapping",
    "acceptsBatch": true,
    "lastUpdated": "2023-05-23T13:12:44.2896624-05:00",
    "properties": {
      "officeId": {
        "sourcedFrom": "OfficeId"
      },
      "name": {
        "sourcedFrom": "Name"
      },
      "productId": {
        "sourcedFrom": "productList/productId"
      },
      "category": {
        "sourcedFrom": "category"
      }
    },
    "namespaces": {},
    "relatedEntityMappings": [
      {
        "relatedEntityMappingId": "Office.productId:Product",
        "properties": {
          "productId": {
            "sourcedFrom": "productList/productId"
          },
          "productName": {
            "sourcedFrom": "productList/name"
          }
        },
        "targetEntityType": "http://example.org/Product-1.0.0/Product",
        "collections": [
          "mapOfficeStep",
          "Product"
        ],
        "permissions": "data-hub-common,read,data-hub-common,update"
      }
    ]
  },
  "setMapResp": () => {},
  "mapExpTouched": false,
  "setMapExpTouched": () => {},
  "flatArray": [
    {
      "value": "OfficeId",
      "key": "OfficeId",
      "struct": false
    },
    {
      "value": "Name",
      "key": "Name",
      "struct": true
    },
    {
      "value": "FirstName",
      "key": "Name/FirstName",
      "struct": false
    },
    {
      "value": "LastName",
      "key": "Name/LastName",
      "struct": false
    },
    {
      "value": "category",
      "key": "category",
      "struct": false
    },
    {
      "value": "nicknames",
      "key": "nicknames",
      "struct": true
    },
    {
      "value": "Email",
      "key": "Email",
      "struct": false
    },
    {
      "value": "Address",
      "key": "Address",
      "struct": true
    },
    {
      "value": "Shipping",
      "key": "Address/Shipping",
      "struct": true
    },
    {
      "value": "Street",
      "key": "Address/Shipping/Street",
      "struct": false
    },
    {
      "value": "Street2",
      "key": "Address/Shipping/Street2",
      "struct": false
    },
    {
      "value": "City",
      "key": "Address/Shipping/City",
      "struct": false
    },
    {
      "value": "State",
      "key": "Address/Shipping/State",
      "struct": false
    },
    {
      "value": "Postal",
      "key": "Address/Shipping/Postal",
      "struct": false
    },
    {
      "value": "Billing",
      "key": "Address/Billing",
      "struct": true
    },
    {
      "value": "Street",
      "key": "Address/Billing/Street",
      "struct": false
    },
    {
      "value": "City",
      "key": "Address/Billing/City",
      "struct": false
    },
    {
      "value": "State",
      "key": "Address/Billing/State",
      "struct": false
    },
    {
      "value": "Postal",
      "key": "Address/Billing/Postal",
      "struct": false
    },
    {
      "value": "Phone",
      "key": "Phone",
      "struct": false
    },
    {
      "value": "PIN",
      "key": "PIN",
      "struct": false
    },
    {
      "value": "officeSince",
      "key": "officeSince",
      "struct": false
    },
    {
      "value": "Status",
      "key": "Status",
      "struct": false
    },
    {
      "value": "productList",
      "key": "productList",
      "struct": true
    },
    {
      "value": "productId",
      "key": "productList/productId",
      "struct": false
    },
    {
      "value": "name",
      "key": "productList/name",
      "struct": false
    }
  ],
  "saveMapping": () => {},
  "dummyNode": {
    "current": "<div />"
  },
  "getInitialChars": () => {},
  "canReadWrite": true,
  "entityTypeTitle": "Product (Office productId)",
  "entityModel": {
    "info": {
      "title": "Product",
      "version": "1.0.0",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Product": {
        "properties": {
          "productId": {
            "datatype": "integer"
          },
          "productName": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "category": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          }
        }
      }
    }
  },
  "checkedEntityColumns": {
    "name": true,
    "type": true,
    "key": true,
    "value": true
  },
  "entityTypeProperties": [
    {
      "key": 126,
      "name": "Context",
      "type": "",
      "isProperty": false,
      "filterName": "Context",
      "filterMatch": false,
      "parentVal": ""
    },
    {
      "key": 127,
      "name": "URI",
      "type": "",
      "isProperty": false,
      "filterName": "URI",
      "filterMatch": false,
      "parentVal": ""
    },
    {
      "key": 128,
      "name": "productId",
      "filterName": "productId",
      "filterMatch": false,
      "isProperty": true,
      "type": "integer",
      "parentVal": ""
    },
    {
      "key": 129,
      "name": "productName",
      "filterName": "productName",
      "filterMatch": false,
      "isProperty": true,
      "type": "string",
      "parentVal": ""
    },
    {
      "key": 130,
      "name": "category",
      "filterName": "category",
      "filterMatch": false,
      "isProperty": true,
      "type": "string",
      "parentVal": ""
    }
  ],
  "entityMappingId": "Office.productId:Product",
  "entityExpandedKeys": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    108,
    115
  ],
  "setEntityExpandedKeys": () => {},
  "allEntityKeys": [
    108,
    112,
    115,
    119
  ],
  "setExpandedEntityFlag": () => {},
  "initialEntityKeys": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    108,
    115
  ],
  "tooltipsData": {
    "sourceDatabase": "The database where the input data is read from. For mapping, the default is data-hub-STAGING.",
    "targetDatabase": "The database where to store the processed data. For mapping, the default is data-hub-FINAL.",
    "provGranularity": "<Fragment />",
    "missingPermission": "Contact your security administrator for access."
  },
  "updateStep": () => {},
  "relatedEntityTypeProperties": [
    {
      "entityType": "Product",
      "entityModel": {
        "info": {
          "title": "Product",
          "version": "1.0.0",
          "baseUri": "http://example.org/"
        },
        "definitions": {
          "Product": {
            "properties": {
              "productId": {
                "datatype": "integer"
              },
              "productName": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              },
              "category": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              }
            }
          }
        }
      },
      "entityLabel": "Product (Office productId)",
      "entityMappingId": "Office.productId:Product",
      "entityProps": [
        {
          "key": 126,
          "name": "Context",
          "type": "",
          "isProperty": false,
          "filterName": "Context",
          "filterMatch": false,
          "parentVal": ""
        },
        {
          "key": 127,
          "name": "URI",
          "type": "",
          "isProperty": false,
          "filterName": "URI",
          "filterMatch": false,
          "parentVal": ""
        },
        {
          "key": 128,
          "name": "productId",
          "filterName": "productId",
          "filterMatch": false,
          "isProperty": true,
          "type": "integer",
          "parentVal": ""
        },
        {
          "key": 129,
          "name": "productName",
          "filterName": "productName",
          "filterMatch": false,
          "isProperty": true,
          "type": "string",
          "parentVal": ""
        },
        {
          "key": 130,
          "name": "category",
          "filterName": "category",
          "filterMatch": false,
          "isProperty": true,
          "type": "string",
          "parentVal": ""
        }
      ]
    },
    {
      "entityType": "Customer",
      "entityModel": {
        "info": {
          "title": "Customer",
          "version": "0.0.1",
          "baseUri": "http://example.org/",
          "draft": false
        },
        "definitions": {
          "Customer": {
            "properties": {
              "customerId": {
                "datatype": "integer",
                "sortable": true
              },
              "name": {
                "datatype": "string",
                "description": "This has a case-insensitive collation for the match queries that use range indexes",
                "collation": "http://marklogic.com/collation//S2",
                "facetable": true,
                "sortable": true
              },
              "email": {
                "datatype": "string",
                "description": "This has a case-insensitive collation for the match queries that use range indexes",
                "collation": "http://marklogic.com/collation//S2",
                "facetable": true
              },
              "pin": {
                "datatype": "integer",
                "facetable": true,
                "sortable": true
              },
              "nicknames": {
                "datatype": "array",
                "description": "Example of a multi-value property of simple values",
                "items": {
                  "datatype": "string"
                }
              },
              "hasOffice": {
                "datatype": "integer",
                "relatedEntityType": "http://example.org/Office-0.0.1/Office",
                "joinPropertyName": "officeId"
              },
              "shipping": {
                "datatype": "array",
                "description": "Example of a multi-value property of structured values",
                "items": {
                  "$ref": "#/definitions/Address"
                },
                "subProperties": {
                  "street": {
                    "datatype": "array",
                    "items": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                    }
                  },
                  "city": {
                    "datatype": "string",
                    "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "state": {
                    "datatype": "string",
                    "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "zip": {
                    "$ref": "#/definitions/Zip",
                    "subProperties": {
                      "fiveDigit": {
                        "datatype": "string",
                        "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "plusFour": {
                        "datatype": "string",
                        "collation": "http://marklogic.com/collation/codepoint"
                      }
                    }
                  }
                }
              },
              "billing": {
                "description": "Example of a single-value structured property",
                "$ref": "#/definitions/Address",
                "subProperties": {
                  "street": {
                    "datatype": "array",
                    "items": {
                      "datatype": "string",
                      "collation": "http://marklogic.com/collation/codepoint"
                    }
                  },
                  "city": {
                    "datatype": "string",
                    "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "state": {
                    "datatype": "string",
                    "collation": "http://marklogic.com/collation/codepoint"
                  },
                  "zip": {
                    "$ref": "#/definitions/Zip",
                    "subProperties": {
                      "fiveDigit": {
                        "datatype": "string",
                        "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "plusFour": {
                        "datatype": "string",
                        "collation": "http://marklogic.com/collation/codepoint"
                      }
                    }
                  }
                }
              },
              "birthDate": {
                "datatype": "date",
                "facetable": true
              },
              "status": {
                "datatype": "string"
              },
              "customerSince": {
                "datatype": "date"
              },
              "hasShoe": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              }
            }
          }
        }
      },
      "entityLabel": "Customer (hasOffice Office)",
      "entityMappingId": "Office.officeId:Customer",
      "entityProps": [
        {
          "key": 131,
          "name": "Context",
          "type": "",
          "isProperty": false,
          "filterName": "Context",
          "filterMatch": false
        },
        {
          "key": 132,
          "name": "URI",
          "type": "",
          "isProperty": false,
          "filterName": "URI",
          "filterMatch": false
        },
        {
          "key": 133,
          "name": "customerId",
          "filterName": "customerId",
          "filterMatch": false,
          "isProperty": true,
          "type": "integer"
        },
        {
          "key": 134,
          "name": "name",
          "filterName": "name",
          "filterMatch": false,
          "isProperty": true,
          "type": "string"
        },
        {
          "key": 135,
          "name": "email",
          "filterName": "email",
          "filterMatch": false,
          "isProperty": true,
          "type": "string"
        },
        {
          "key": 136,
          "name": "pin",
          "filterName": "pin",
          "filterMatch": false,
          "isProperty": true,
          "type": "integer"
        },
        {
          "key": 137,
          "name": "nicknames",
          "filterName": "nicknames",
          "filterMatch": false,
          "isProperty": true,
          "type": "parent-string [ ]"
        },
        {
          "key": 138,
          "name": "hasOffice",
          "filterName": "hasOffice",
          "filterMatch": false,
          "isProperty": true,
          "type": "integer",
          "relatedEntityType": "http://example.org/Office-0.0.1/Office",
          "joinPropertyName": "officeId"
        },
        {
          "key": 139,
          "name": "shipping",
          "filterName": "shipping",
          "filterMatch": false,
          "isProperty": true,
          "type": "parent-Address [ ]",
          "children": [
            {
              "key": 140,
              "name": "shipping/street",
              "filterName": "street",
              "filterMatch": false,
              "isProperty": true,
              "type": "parent-string [ ]"
            },
            {
              "key": 141,
              "name": "shipping/city",
              "filterName": "city",
              "filterMatch": false,
              "isProperty": true,
              "type": "string"
            },
            {
              "key": 142,
              "name": "shipping/state",
              "filterName": "state",
              "filterMatch": false,
              "isProperty": true,
              "type": "string"
            },
            {
              "key": 143,
              "name": "shipping/zip",
              "filterName": "zip",
              "filterMatch": false,
              "isProperty": true,
              "type": "parent-Zip",
              "children": [
                {
                  "key": 144,
                  "name": "shipping/zip/fiveDigit",
                  "filterName": "fiveDigit",
                  "filterMatch": false,
                  "isProperty": true,
                  "type": "string"
                },
                {
                  "key": 145,
                  "name": "shipping/zip/plusFour",
                  "filterName": "plusFour",
                  "filterMatch": false,
                  "isProperty": true,
                  "type": "string"
                }
              ]
            }
          ]
        },
        {
          "key": 146,
          "name": "billing",
          "filterName": "billing",
          "filterMatch": false,
          "isProperty": true,
          "type": "parent-Address",
          "children": [
            {
              "key": 147,
              "name": "billing/street",
              "filterName": "street",
              "filterMatch": false,
              "isProperty": true,
              "type": "parent-string [ ]"
            },
            {
              "key": 148,
              "name": "billing/city",
              "filterName": "city",
              "filterMatch": false,
              "isProperty": true,
              "type": "string"
            },
            {
              "key": 149,
              "name": "billing/state",
              "filterName": "state",
              "filterMatch": false,
              "isProperty": true,
              "type": "string"
            },
            {
              "key": 150,
              "name": "billing/zip",
              "filterName": "zip",
              "filterMatch": false,
              "isProperty": true,
              "type": "parent-Zip",
              "children": [
                {
                  "key": 151,
                  "name": "billing/zip/fiveDigit",
                  "filterName": "fiveDigit",
                  "filterMatch": false,
                  "isProperty": true,
                  "type": "string"
                },
                {
                  "key": 152,
                  "name": "billing/zip/plusFour",
                  "filterName": "plusFour",
                  "filterMatch": false,
                  "isProperty": true,
                  "type": "string"
                }
              ]
            }
          ]
        },
        {
          "key": 153,
          "name": "birthDate",
          "filterName": "birthDate",
          "filterMatch": false,
          "isProperty": true,
          "type": "date"
        },
        {
          "key": 154,
          "name": "status",
          "filterName": "status",
          "filterMatch": false,
          "isProperty": true,
          "type": "string"
        },
        {
          "key": 155,
          "name": "customerSince",
          "filterName": "customerSince",
          "filterMatch": false,
          "isProperty": true,
          "type": "date"
        },
        {
          "key": 156,
          "name": "hasShoe",
          "filterName": "hasShoe",
          "filterMatch": false,
          "isProperty": true,
          "type": "string"
        }
      ]
    }
  ],
  "relatedEntitiesSelected": [
    {
      "entityType": "Product",
      "entityModel": {
        "info": {
          "title": "Product",
          "version": "1.0.0",
          "baseUri": "http://example.org/"
        },
        "definitions": {
          "Product": {
            "properties": {
              "productId": {
                "datatype": "integer"
              },
              "productName": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              },
              "category": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              }
            }
          }
        }
      },
      "entityLabel": "Product (Office productId)",
      "entityMappingId": "Office.productId:Product",
      "entityProps": [
        {
          "key": 126,
          "name": "Context",
          "type": "",
          "isProperty": false,
          "filterName": "Context",
          "filterMatch": false,
          "parentVal": ""
        },
        {
          "key": 127,
          "name": "URI",
          "type": "",
          "isProperty": false,
          "filterName": "URI",
          "filterMatch": false,
          "parentVal": ""
        },
        {
          "key": 128,
          "name": "productId",
          "filterName": "productId",
          "filterMatch": false,
          "isProperty": true,
          "type": "integer",
          "parentVal": ""
        },
        {
          "key": 129,
          "name": "productName",
          "filterName": "productName",
          "filterMatch": false,
          "isProperty": true,
          "type": "string",
          "parentVal": ""
        },
        {
          "key": 130,
          "name": "category",
          "filterName": "category",
          "filterMatch": false,
          "isProperty": true,
          "type": "string",
          "parentVal": ""
        }
      ]
    }
  ],
  "setRelatedEntitiesSelected": () => {},
  "isRelatedEntity": true,
  "tableColor": "#e4f1f4",
  "firstRowTableKeyIndex": 1,
  "filterStr": "",
  "setFilterStr": () => {},
  "allRelatedEntitiesKeys": [
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109,
    110,
    111,
    112,
    113,
    114,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    123,
    124,
    125,
    126,
    127,
    128,
    129,
    130
  ],
  "setAllRelatedEntitiesKeys": () => {},
  "mapFunctions": [
    {
      "signature": "abs(xs:numeric?) as xs:numeric?",
      "functionName": "abs",
      "category": "xpath"
    },
    {
      "signature": "adjust-date-to-timezone(xs:date?, [xs:dayTimeDuration?]) as xs:date?",
      "functionName": "adjust-date-to-timezone",
      "category": "xpath"
    },
    {
      "signature": "adjust-dateTime-to-timezone(xs:dateTime?, [xs:dayTimeDuration?]) as xs:dateTime?",
      "functionName": "adjust-dateTime-to-timezone",
      "category": "xpath"
    },
    {
      "signature": "adjust-time-to-timezone(xs:time?, [xs:dayTimeDuration?]) as xs:time?",
      "functionName": "adjust-time-to-timezone",
      "category": "xpath"
    },
    {
      "signature": "avg(xs:anyAtomicType*) as xs:anyAtomicType?",
      "functionName": "avg",
      "category": "xpath"
    },
    {
      "signature": "boolean(xs:anyAtomicType?) as xs:boolean?",
      "functionName": "boolean",
      "category": "xpath"
    },
    {
      "signature": "ceiling(xs:numeric?) as xs:numeric?",
      "functionName": "ceiling",
      "category": "xpath"
    },
    {
      "functionName": "cleanPrefix",
      "signature": "cleanPrefix(input)",
      "category": "custom"
    },
    {
      "signature": "codepoint-equal(xs:string?, xs:string?) as xs:boolean?",
      "functionName": "codepoint-equal",
      "category": "xpath"
    },
    {
      "signature": "codepoints-to-string(xs:integer*) as xs:string",
      "functionName": "codepoints-to-string",
      "category": "xpath"
    },
    {
      "signature": "compare(xs:string?, xs:string?, [xs:string]) as xs:integer?",
      "functionName": "compare",
      "category": "xpath"
    },
    {
      "signature": "concat(xs:anyAtomicType?) as xs:string?",
      "functionName": "concat",
      "category": "xpath"
    },
    {
      "signature": "contains(xs:string?, xs:string?, [xs:string]) as xs:boolean",
      "functionName": "contains",
      "category": "xpath"
    },
    {
      "signature": "count(item()*, [xs:double?]) as xs:integer",
      "functionName": "count",
      "category": "xpath"
    },
    {
      "signature": "current-date() as xs:date",
      "functionName": "current-date",
      "category": "xpath"
    },
    {
      "signature": "current-dateTime() as xs:dateTime",
      "functionName": "current-dateTime",
      "category": "xpath"
    },
    {
      "signature": "current-time() as xs:time",
      "functionName": "current-time",
      "category": "xpath"
    },
    {
      "signature": "data([item()*]) as xs:anyAtomicType*",
      "functionName": "data",
      "category": "xpath"
    },
    {
      "signature": "day-from-date(xs:date?) as xs:integer?",
      "functionName": "day-from-date",
      "category": "xpath"
    },
    {
      "signature": "day-from-dateTime(xs:dateTime?) as xs:integer?",
      "functionName": "day-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "days-from-duration(xs:duration?) as xs:integer?",
      "functionName": "days-from-duration",
      "category": "xpath"
    },
    {
      "functionName": "documentLookup",
      "signature": "documentLookup(key,dictionary-uri)",
      "category": "builtin"
    },
    {
      "signature": "empty(item()*) as xs:boolean",
      "functionName": "empty",
      "category": "xpath"
    },
    {
      "signature": "encode-for-uri(xs:string?) as xs:string",
      "functionName": "encode-for-uri",
      "category": "xpath"
    },
    {
      "signature": "ends-with(xs:string?, xs:string?, [xs:string]) as xs:boolean",
      "functionName": "ends-with",
      "category": "xpath"
    },
    {
      "signature": "escape-html-uri(xs:string?) as xs:string",
      "functionName": "escape-html-uri",
      "category": "xpath"
    },
    {
      "signature": "escape-uri(xs:string, xs:boolean) as xs:string",
      "functionName": "escape-uri",
      "category": "xpath"
    },
    {
      "signature": "exists(item()*) as xs:boolean",
      "functionName": "exists",
      "category": "xpath"
    },
    {
      "signature": "false() as xs:boolean",
      "functionName": "false",
      "category": "xpath"
    },
    {
      "signature": "floor(xs:double) as xs:double",
      "functionName": "floor",
      "category": "xpath"
    },
    {
      "signature": "format-date(xs:date?, xs:string, xs:string?, xs:string?, [xs:string?]) as xs:string",
      "functionName": "format-date",
      "category": "xpath"
    },
    {
      "signature": "format-dateTime(xs:dateTime?, xs:string, xs:string?, xs:string?, [xs:string?]) as xs:string",
      "functionName": "format-dateTime",
      "category": "xpath"
    },
    {
      "signature": "format-number(xs:numeric*, xs:string, [xs:string]) as xs:string",
      "functionName": "format-number",
      "category": "xpath"
    },
    {
      "signature": "format-time(xs:time?, xs:string, xs:string?, xs:string?, [xs:string?]) as xs:string",
      "functionName": "format-time",
      "category": "xpath"
    },
    {
      "signature": "generate-id([node()?]) as xs:string",
      "functionName": "generate-id",
      "category": "xpath"
    },
    {
      "signature": "head(item()*) as item()?",
      "functionName": "head",
      "category": "xpath"
    },
    {
      "signature": "hours-from-dateTime(xs:dateTime?) as xs:integer?",
      "functionName": "hours-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "hours-from-duration(xs:duration?) as xs:integer?",
      "functionName": "hours-from-duration",
      "category": "xpath"
    },
    {
      "signature": "hours-from-time(xs:time?) as xs:integer?",
      "functionName": "hours-from-time",
      "category": "xpath"
    },
    {
      "functionName": "hubURI",
      "signature": "hubURI(entity-type)",
      "category": "builtin"
    },
    {
      "signature": "implicit-timezone() as xs:dayTimeDuration",
      "functionName": "implicit-timezone",
      "category": "xpath"
    },
    {
      "signature": "insert-before(item()*, xs:integer, item()*) as item()*",
      "functionName": "insert-before",
      "category": "xpath"
    },
    {
      "signature": "iri-to-uri(xs:string?) as xs:string",
      "functionName": "iri-to-uri",
      "category": "xpath"
    },
    {
      "signature": "lang(xs:string?, [node()?]) as xs:boolean",
      "functionName": "lang",
      "category": "xpath"
    },
    {
      "signature": "last() as xs:integer",
      "functionName": "last",
      "category": "xpath"
    },
    {
      "signature": "local-name([node()?]) as xs:string",
      "functionName": "local-name",
      "category": "xpath"
    },
    {
      "functionName": "lookup",
      "signature": "lookup(key,object)",
      "category": "builtin"
    },
    {
      "signature": "lower-case(xs:string?) as xs:string?",
      "functionName": "lower-case",
      "category": "xpath"
    },
    {
      "signature": "matches(xs:string?, xs:string, [xs:string]) as xs:boolean?",
      "functionName": "matches",
      "category": "xpath"
    },
    {
      "signature": "max(xs:anyAtomicType*, [xs:string]) as xs:anyAtomicType?",
      "functionName": "max",
      "category": "xpath"
    },
    {
      "functionName": "memoryLookup",
      "signature": "memoryLookup(key,dictionary)",
      "category": "builtin"
    },
    {
      "signature": "min(xs:anyAtomicType*, [xs:string]) as xs:anyAtomicType?",
      "functionName": "min",
      "category": "xpath"
    },
    {
      "signature": "minutes-from-dateTime(xs:dateTime?) as xs:integer?",
      "functionName": "minutes-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "minutes-from-duration(xs:duration?) as xs:integer?",
      "functionName": "minutes-from-duration",
      "category": "xpath"
    },
    {
      "signature": "minutes-from-time(xs:time?) as xs:integer?",
      "functionName": "minutes-from-time",
      "category": "xpath"
    },
    {
      "signature": "month-from-date(xs:date?) as xs:integer?",
      "functionName": "month-from-date",
      "category": "xpath"
    },
    {
      "signature": "month-from-dateTime(xs:dateTime?) as xs:integer?",
      "functionName": "month-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "months-from-duration(xs:duration?) as xs:integer?",
      "functionName": "months-from-duration",
      "category": "xpath"
    },
    {
      "signature": "name([node()?]) as xs:string",
      "functionName": "name",
      "category": "xpath"
    },
    {
      "signature": "namespace-uri([node()?]) as xs:anyURI",
      "functionName": "namespace-uri",
      "category": "xpath"
    },
    {
      "signature": "namespace-uri-for-prefix(xs:string?, element()) as xs:anyURI?",
      "functionName": "namespace-uri-for-prefix",
      "category": "xpath"
    },
    {
      "signature": "node-name([node()?]) as xs:QName?",
      "functionName": "node-name",
      "category": "xpath"
    },
    {
      "signature": "normalize-space([xs:string?]) as xs:string?",
      "functionName": "normalize-space",
      "category": "xpath"
    },
    {
      "signature": "normalize-unicode(xs:string?, [xs:string]) as xs:string?",
      "functionName": "normalize-unicode",
      "category": "xpath"
    },
    {
      "signature": "not(item()*) as xs:boolean",
      "functionName": "not",
      "category": "xpath"
    },
    {
      "signature": "number([xs:anyAtomicType?]) as xs:double",
      "functionName": "number",
      "category": "xpath"
    },
    {
      "functionName": "parseDate",
      "signature": "parseDate(value,pattern)",
      "category": "builtin"
    },
    {
      "functionName": "parseDateTime",
      "signature": "parseDateTime(value,pattern)",
      "category": "builtin"
    },
    {
      "signature": "position() as xs:integer",
      "functionName": "position",
      "category": "xpath"
    },
    {
      "signature": "remove(item()*, xs:integer) as item()*",
      "functionName": "remove",
      "category": "xpath"
    },
    {
      "functionName": "remove-hyphens",
      "signature": "remove-hyphens(val)",
      "category": "custom"
    },
    {
      "functionName": "removeCommas",
      "signature": "removeCommas(input)",
      "category": "custom"
    },
    {
      "signature": "replace(xs:string?, xs:string?, xs:string?, [xs:string?]) as xs:string?",
      "functionName": "replace",
      "category": "xpath"
    },
    {
      "signature": "resolve-QName(xs:string?, element()) as xs:QName?",
      "functionName": "resolve-QName",
      "category": "xpath"
    },
    {
      "signature": "reverse(item()*) as item()*",
      "functionName": "reverse",
      "category": "xpath"
    },
    {
      "signature": "root([node()?]) as node()?",
      "functionName": "root",
      "category": "xpath"
    },
    {
      "signature": "round(xs:numeric?) as xs:numeric?",
      "functionName": "round",
      "category": "xpath"
    },
    {
      "signature": "round-half-to-even(xs:numeric?, [xs:integer]) as xs:numeric?",
      "functionName": "round-half-to-even",
      "category": "xpath"
    },
    {
      "signature": "seconds-from-dateTime(xs:dateTime?) as xs:decimal?",
      "functionName": "seconds-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "seconds-from-duration(xs:duration?) as xs:decimal?",
      "functionName": "seconds-from-duration",
      "category": "xpath"
    },
    {
      "signature": "seconds-from-time(xs:time?) as xs:decimal?",
      "functionName": "seconds-from-time",
      "category": "xpath"
    },
    {
      "signature": "starts-with(xs:string?, xs:string?, [xs:string]) as xs:boolean",
      "functionName": "starts-with",
      "category": "xpath"
    },
    {
      "signature": "string([xs:anyAtomicType?]) as xs:string?",
      "functionName": "string",
      "category": "xpath"
    },
    {
      "signature": "string-join(xs:string*, [xs:string]) as xs:string",
      "functionName": "string-join",
      "category": "xpath"
    },
    {
      "signature": "string-length([xs:string?]) as xs:integer?",
      "functionName": "string-length",
      "category": "xpath"
    },
    {
      "signature": "string-to-codepoints(xs:string?) as xs:integer*",
      "functionName": "string-to-codepoints",
      "category": "xpath"
    },
    {
      "signature": "subsequence(item()*, xs:numeric, [xs:numeric]) as item()*",
      "functionName": "subsequence",
      "category": "xpath"
    },
    {
      "signature": "substring(xs:string?, xs:numeric?, [xs:numeric?]) as xs:string?",
      "functionName": "substring",
      "category": "xpath"
    },
    {
      "signature": "substring-after(xs:string?, xs:string?, [xs:string]) as xs:string?",
      "functionName": "substring-after",
      "category": "xpath"
    },
    {
      "signature": "substring-before(xs:string?, xs:string?, [xs:string]) as xs:string?",
      "functionName": "substring-before",
      "category": "xpath"
    },
    {
      "signature": "sum(xs:anyAtomicType*, [xs:anyAtomicType?]) as xs:anyAtomicType?",
      "functionName": "sum",
      "category": "xpath"
    },
    {
      "signature": "tail(item()*) as item()*",
      "functionName": "tail",
      "category": "xpath"
    },
    {
      "signature": "timezone-from-date(xs:date?) as xs:dayTimeDuration?",
      "functionName": "timezone-from-date",
      "category": "xpath"
    },
    {
      "signature": "timezone-from-dateTime(xs:dateTime?) as xs:dayTimeDuration?",
      "functionName": "timezone-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "timezone-from-time(xs:time?) as xs:dayTimeDuration?",
      "functionName": "timezone-from-time",
      "category": "xpath"
    },
    {
      "signature": "tokenize(xs:string?, xs:string?, [xs:string?]) as xs:string*",
      "functionName": "tokenize",
      "category": "xpath"
    },
    {
      "signature": "translate(xs:string?, xs:string, xs:string) as xs:string?",
      "functionName": "translate",
      "category": "xpath"
    },
    {
      "signature": "true() as xs:boolean",
      "functionName": "true",
      "category": "xpath"
    },
    {
      "signature": "upper-case(xs:string?) as xs:string?",
      "functionName": "upper-case",
      "category": "xpath"
    },
    {
      "signature": "year-from-date(xs:date?) as xs:integer?",
      "functionName": "year-from-date",
      "category": "xpath"
    },
    {
      "signature": "year-from-dateTime(xs:dateTime?) as xs:integer?",
      "functionName": "year-from-dateTime",
      "category": "xpath"
    },
    {
      "signature": "years-from-duration(xs:duration?) as xs:integer?",
      "functionName": "years-from-duration",
      "category": "xpath"
    }
  ],
  "mapRefs": [
    {
      "name": "$URI",
      "description": "The URI of the source document"
    }
  ],
  "savedMappingArt": {
    "collections": [
      "mapOfficeStep",
      "Office"
    ],
    "additionalCollections": [],
    "permissions": "data-hub-common,read,data-hub-common,update",
    "batchSize": 100,
    "validateEntity": "doNotValidate",
    "targetFormat": "json",
    "attachSourceDocument": false,
    "sourceRecordScope": "instanceOnly",
    "name": "mapOfficeStep",
    "targetEntityType": "http://example.org/Office-0.0.1/Office",
    "description": "",
    "collection": [
      "loadOffice"
    ],
    "selectedSource": "collection",
    "sourceQuery": "cts.collectionQuery(['loadOffice'])",
    "targetDatabase": "data-hub-FINAL",
    "headers": {},
    "interceptors": [],
    "provenanceGranularityLevel": "off",
    "customHook": {},
    "sourceDatabase": "data-hub-STAGING",
    "stepDefinitionName": "entity-services-mapping",
    "stepDefinitionType": "mapping",
    "stepId": "mapOfficeStep-mapping",
    "acceptsBatch": true,
    "lastUpdated": "2023-05-23T13:12:44.2896624-05:00",
    "properties": {
      "officeId": {
        "sourcedFrom": "OfficeId"
      },
      "name": {
        "sourcedFrom": "Name"
      },
      "productId": {
        "sourcedFrom": "productList/productId"
      },
      "category": {
        "sourcedFrom": "category"
      }
    },
    "namespaces": {},
    "relatedEntityMappings": [
      {
        "relatedEntityMappingId": "Office.productId:Product",
        "properties": {
          "productId": {
            "sourcedFrom": "productList/productId"
          },
          "productName": {
            "sourcedFrom": "productList/name"
          }
        },
        "targetEntityType": "http://example.org/Product-1.0.0/Product",
        "collections": [
          "mapOfficeStep",
          "Product"
        ],
        "permissions": "data-hub-common,read,data-hub-common,update"
      }
    ]
  },
  "deleteRelatedEntity": () => {},
  "labelRemoved": "",
  "entityLoaded": true
};

export const environmentMock = "{\"serviceName\":\"en2010542.endava.net-cluster\",\"dataHubVersion\":\"6.0-SNAPSHOT\",\"marklogicVersion\":\"10.0-9\",\"hubCentralVersion\":\"6.0-SNAPSHOT\",\"host\":\"localhost\",\"stagingDb\":\"data-hub-STAGING\",\"finalDb\":\"data-hub-FINAL\",\"jobsDb\":\"data-hub-JOBS\",\"sessionTimeout\":\"1200\",\"sessionToken\":\"306d03b6-6957-4df8-8839-f979f04cb053\",\"pendoKey\":null,\"supportConcepts\":true}";