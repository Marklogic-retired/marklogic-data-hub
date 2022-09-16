const headerContentDefault = `[ "headers": [
  "validationEnabled": true,
  "validationParameters": [
    "min": 0,
    "max": 10]]]`;

const loads = {"data":
    [{
      "name": "testLoad",
      "description": "Test JSON.",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIReplacement": "",
      "inputFilePath": "/json-test/data-sets/testLoad",
      "lastUpdated": "2000-01-01T12:00:00.000000-00:00",
    }],
"status": 200
};

const models = {"data": [
  {
    "info": {
      "title": "Client",
      "version": "0.0.1",
      "baseUri": "http://example.org/",
      "draft": false
    },
    "definitions": {
      "Client": {
        "required": [],
        "wordLexicon": [],
        "properties": {
          "firstname": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "lastname": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "email": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "postal": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "phone": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "pin": {
            "datatype": "int",
            "facetable": true
          },
          "updated": {
            "datatype": "dateTime",
            "facetable": true
          }
        },
        "description": ""
      }
    }
  },
  {
    "info": {
      "title": "ProductDetail",
      "version": "0.0.1",
      "baseUri": "http://example.org/",
      "draft": false
    },
    "definitions": {
      "ProductInfo": {
        "required": [],
        "wordLexicon": [],
        "properties": {
          "productName": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          },
          "productType": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true
          }
        },
        "description": "This entity has no matching definition as entity title so no info will be displayed"
      }
    }
  },
  {
    "info": {
      "title": "Order",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/example/",
      "draft": false
    },
    "definitions": {
      "Order": {
        "required": [],
        "primaryKey": "orderId",
        "properties": {
          "orderId": {
            "datatype": "string"
          },
          "address": {
            "$ref": "#/definitions/Address"
          },
          "orderDetails": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/OrderDetails"
            }
          },
          "shipRegion": {
            "datatype": "array",
            "items": {
              "datatype": "string"
            }
          },
          "shippedDate": {
            "datatype": "dateTime"
          }
        },
        "description": ""
      },
      "Address": {
        "properties": {
          "city": {
            "datatype": "string"
          },
          "state": {
            "datatype": "string"
          }
        }
      },
      "OrderDetails": {
        "properties": {
          "productID": {
            "datatype": "string"
          },
          "unitPrice": {
            "datatype": "double"
          },
          "quantity": {
            "datatype": "integer"
          },
          "discount": {
            "datatype": "float"
          }
        }
      }
    }
  },
  {
    "info": {
      "title": "Product",
      "version": "1.0.0",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Product": {
        "primaryKey": "productId",
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
        },
        "relatedConcepts": [
          {
            "context": "category",
            "predicate": "isCategory",
            "conceptExpression": "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))",
            "conceptClass": "ShoeType"
          }
        ]
      }
    }
  },
  {
    "info": {
      "title": "BabyRegistry",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/example/",
      "draft": false
    },
    "definitions": {
      "BabyRegistry": {
        "primaryKey": "babyRegistryId",
        "properties": {
          "babyRegistryId": {
            "datatype": "integer"
          },
          "arrivalDate": {
            "datatype": "date"
          },
          "ownedBy": {
            "datatype": "integer",
            "relatedEntityType": "http://example.org/Customer-0.0.1/Customer",
            "joinPropertyName": "customerId"
          }
        },
        "description": ""
      }
    }
  },
  {
    "info": {
      "title": "Office",
      "version": "0.0.1",
      "baseUri": "http://example.org/",
      "draft": false
    },
    "definitions": {
      "Office": {
        "required": [
          "name"
        ],
        "pii": [
          "pin"
        ],
        "primaryKey": "officeId",
        "properties": {
          "officeId": {
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
          "category": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
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
          "shipping": {
            "datatype": "array",
            "description": "Example of a multi-value property of structured values",
            "items": {
              "$ref": "#/definitions/Address"
            }
          },
          "billing": {
            "description": "Example of a single-value structured property",
            "$ref": "#/definitions/Address"
          },
          "birthDate": {
            "datatype": "date",
            "facetable": true
          },
          "status": {
            "datatype": "string"
          },
          "officeSince": {
            "datatype": "date"
          },
          "orders": {
            "datatype": "array",
            "description": "Example of a relationship to another entity type",
            "items": {
              "$ref": "http://example.org/Order-0.0.1/Order"
            }
          },
          "productId": {
            "datatype": "array",
            "facetable": false,
            "sortable": false,
            "items": {
              "datatype": "integer",
              "relatedEntityType": "http://example.org/Product-1.0.0/Product",
              "joinPropertyName": "productId"
            }
          }
        },
        "relatedConcepts": [
          {
            "context": "category",
            "predicate": "isCategory",
            "conceptExpression": "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))",
            "conceptClass": "ClothStyle"
          }
        ],
        "description": ""
      },
      "Address": {
        "required": [],
        "pii": [],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
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
            "$ref": "#/definitions/Zip"
          }
        }
      },
      "Zip": {
        "required": [],
        "properties": {
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
  {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://example.org/",
      "draft": false
    },
    "definitions": {
      "Person": {
        "primaryKey": "id",
        "required": [],
        "pii": [
          "SSN"
        ],
        "wordLexicon": [],
        "properties": {
          "id": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "fname": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true,
            "sortable": true
          },
          "lname": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2",
            "facetable": true,
            "sortable": true
          },
          "desc": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "SSN": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "ZipCode": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "Address": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          },
          "DateOfBirth": {
            "datatype": "date"
          }
        },
        "description": ""
      }
    }
  },
  {
    "info": {
      "title": "Customer",
      "version": "0.0.1",
      "baseUri": "http://example.org/",
      "draft": false
    },
    "definitions": {
      "Customer": {
        "required": [
          "name"
        ],
        "pii": [
          "pin"
        ],
        "primaryKey": "customerId",
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
            }
          },
          "billing": {
            "description": "Example of a single-value structured property",
            "$ref": "#/definitions/Address"
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
          "orders": {
            "datatype": "array",
            "description": "Example of a relationship to another entity type",
            "items": {
              "$ref": "http://example.org/Order-0.0.1/Order"
            }
          },
          "hasShoe": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          }
        },
        "relatedConcepts": [
          {
            "context": "hasShoe",
            "predicate": "shoes",
            "conceptExpression": "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))",
            "conceptClass": "ShoeType"
          }
        ],
        "description": ""
      },
      "Address": {
        "required": [],
        "pii": [],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
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
            "$ref": "#/definitions/Zip"
          }
        }
      },
      "Zip": {
        "required": [],
        "properties": {
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
  }
]};


const flows = {
  "data": [{
    "name": "testFlow",
    "description": "",
    "steps": [
      {
        "stepName": "testLoad",
        "stepDefinitionType": "INGESTION",
        "stepNumber": "1",
        "sourceFormat": "json"
      }
    ]
  }]
  ,
  "status": 200
};

const loadsXML = {"data":
    [{
      "name": "testLoadXML",
      "description": "Test XML.",
      "sourceFormat": "xml",
      "targetFormat": "xml",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/testLoadXML",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
    }],
"status": 200
};

const loadSettings = {"data":
    {
      "provenanceGranularityLevel": "coarse",
      "batchSize": 35,
      "permissions": "data-hub-operator,read,data-hub-operator,update",
      "targetFormat": "json",
      "targetDatabase": "data-hub-STAGING",
      "collections": [
        "testLoad"
      ],
      "additionalCollections": ["addedCollection"],
      "lastUpdated": "2020-05-27T12:19:02.446622-07:00",
      "headers": {
        "header": true
      },
      "interceptors": {
        "interceptor": true
      },
      "customHook": {
        "hook": true
      }
    },
"status": 200
};

const genericSuccess = {
  data: {},
  status: 200
};

const loadCardProps = {
  addStepToFlow: jest.fn(),
  addStepToNew: jest.fn(),
  canReadOnly: true,
  canReadWrite: false,
  canWriteFlow: false,
  createLoadArtifact: jest.fn(),
  data: {},
  deleteLoadArtifact: jest.fn(),
  flows: {}
};
const data = {
  loadCardProps,
  genericSuccess: genericSuccess,
  headerContentDefault: headerContentDefault,
  flows: flows,
  loads: loads,
  models: models,
  loadsXML: loadsXML,
  loadSettings: loadSettings,
};

export default data;
