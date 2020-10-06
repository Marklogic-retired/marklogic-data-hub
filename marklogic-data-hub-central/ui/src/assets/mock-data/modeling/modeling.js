export const createModelResponse = {
  "info": {
    "title": "AnotherModel",
    "version": "1.0.0",
    "baseUri": "http://example.org/"
  },
  "definitions": {
    "AnotherModel": {
      "properties": {},
      "description": "Testing"
    }
  }
};

export const createModelErrorResponse = {
  "code": 400,
  "message": "An entity type already exists with a name of Testing",
  "suggestion": "Resend the request in the correct format.",
  "details": "An entity type already exists with a name of Testing"
};

export const getEntityTypes = [
  {
      "entityName": "AnotherModel",
      "entityTypeId": "http://example.org/AnotherModel-1.0.0/AnotherModel",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "AnotherModel",
              "version": "1.0.0",
              "baseUri": "http://example.org/"
          },
          "definitions": {
              "AnotherModel": {
                  "properties": {},
                  "description": "Testing"
              }
          }
      }
  },
  {
      "entityName": "Order",
      "entityTypeId": "http://example.org/Order-1.0.0/Order",
      "entityInstanceCount": 2384,
      "model": {
          "info": {
              "title": "Order",
              "version": "1.0.0",
              "baseUri": "http://example.org/",
              "description": "An Order Entity type."
          },
          "definitions": {
              "Order": {
                  "primaryKey": "OrderID",
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [
                      "StringField1",
                      "NumberField1",
                      "ShipCity"
                  ],
                  "rangeIndex": [],
                  "wordLexicon": [],
                  "properties": {
                      "OrderID": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "OrderDate": {
                          "datatype": "dateTime"
                      },
                      "ShippedDate": {
                          "datatype": "date"
                      },
                      "StringField1": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "StringField2": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "StringField3": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "NumberField1": {
                          "datatype": "integer"
                      },
                      "NumberField2": {
                          "datatype": "integer"
                      },
                      "NumberField3": {
                          "datatype": "integer"
                      },
                      "BooleanField1": {
                          "datatype": "boolean"
                      },
                      "BooleanField2": {
                          "datatype": "boolean"
                      },
                      "OrderDetails": {
                          "datatype": "array",
                          "items": {
                              "$ref": "#/definitions/OrderDetail"
                          }
                      },
                      "CustomerID": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ShipCountry": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ShipCity": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      }
                  }
              },
              "OrderDetail": {
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [
                      "ProductID",
                      "UnitPrice",
                      "Quantity",
                      "Date",
                      "DateTime"
                  ],
                  "rangeIndex": [],
                  "wordLexicon": [],
                  "properties": {
                      "ProductID": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "UnitPrice": {
                          "datatype": "double"
                      },
                      "Quantity": {
                          "datatype": "int"
                      },
                      "Discount": {
                          "datatype": "double"
                      },
                      "Date": {
                          "datatype": "date"
                      },
                      "DateTime": {
                          "datatype": "dateTime"
                      }
                  }
              }
          }
      },
      "latestJobDateTime": "2020-04-09T14:28:00.664206-07:00",
      "latestJobId": "6a7286f1-0a74-44a5-b8db-9f8279927729"
  },
  {
      "entityName": "Protein",
      "entityTypeId": "http://example.org/Protein-1.0.0/Protein",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Protein",
              "version": "1.0.0",
              "baseUri": "http://example.org/"
          },
          "definitions": {
              "Protein": {
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [],
                  "rangeIndex": [],
                  "wordLexicon": [],
                  "properties": {
                      "Name": {
                          "datatype": "string",
                          "description": "Protein Name",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ID": {
                          "datatype": "long",
                          "description": "Protein ID"
                      },
                      "Type": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      order: {
                        "$ref": "http://example.org/Protein-1.0.0/Order"
                      }
                  }
              }
          }
      }
  },
  {
      "entityName": "Product",
      "entityTypeId": "http://example.org/Product-1.0.0/Product",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Product",
              "version": "1.0.0",
              "baseUri": "http://example.org/",
              "description": "ajx"
          },
          "definitions": {
              "Product": {
                  "primaryKey": "id",
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [
                      "popularity_tier",
                      "has_accessories"
                  ],
                  "rangeIndex": [],
                  "wordLexicon": [],
                  "properties": {
                      "id": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "title": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "price": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "category": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "popularity_tier": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "has_accessories": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },

                  }
              }
          }
      }
  },
  {
      "entityName": "Provider",
      "entityTypeId": "http://example.org/Provider-1.0.0/Provider",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Provider",
              "version": "1.0.0",
              "baseUri": "http://example.org/"
          },
          "definitions": {
              "Provider": {
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [],
                  "rangeIndex": [],
                  "wordLexicon": [],
                  "properties": {
                      "CA_LICENSE_NO": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "NPI": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "FULL_NAME": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ADD_LINE_1": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ADD_LINE_2": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "CITY": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "STATE": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "ZIP": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      }
                  }
              }
          }
      }
  },
  {
      "entityName": "TestEntityForMapping",
      "entityTypeId": "http://example.org/TestEntityForMapping-1.0.0/TestEntityForMapping",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "TestEntityForMapping",
              "version": "1.0.0",
              "baseUri": "http://example.org/",
              "description": "An TestEntityForMapping entity"
          },
          "definitions": {
              "TestEntityForMapping": {
                  "description": "The TestEntityForMapping entity root.",
                  "required": [],
                  "rangeIndex": [],
                  "elementRangeIndex": [],
                  "wordLexicon": [],
                  "pii": [],
                  "properties": {}
              }
          }
      }
  },
  {
      "entityName": "Customer",
      "entityTypeId": "http://example.org/Customer-1.0.0/Customer",
      "entityInstanceCount": 1000,
      "model": {
          "info": {
              "title": "Customer",
              "version": "1.0.0",
              "baseUri": "http://example.org/",
              "description": "cuss"
          },
          "definitions": {
              "Customer": {
                  "primaryKey": "id",
                  "required": [],
                  "pii": [],
                  "elementRangeIndex": [
                      "credit_score",
                      "sales_region"
                  ],
                  "rangeIndex": [
                      "activity_tier"
                  ],
                  "wordLexicon": [],
                  "properties": {
                      "id": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "first_name": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "last_name": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "address": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "credit_score": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "sales_region": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "activity_tier": {
                          "datatype": "string",
                          "collation": "http://marklogic.com/collation/codepoint"
                      }
                  }
              }
          }
      },
      "latestJobDateTime": "2020-04-09T14:27:51.986901-07:00",
      "latestJobId": "c8f0fbab-689e-47ad-89bf-bdc2ae9da18a"
  }
];

export const editEntityPropertyRequest = { "AnotherModel": {
  "primaryKey": "concept_name",
  "required": [
    "concept_id",
    "domain",
    "concept_name"
  ],
  "pii": [
    "source_concept_code"
  ],
  "elementRangeIndex": [
    "vocabulary",
    "domain",
    "is_standard",
    "invalid_reason"
  ],
  "rangeIndex": [

  ],
  "wordLexicon": [

  ],
  "properties": {
    "concept_id": {
      "datatype": "unsignedLong",
      "description": "The CDM-assigned concept id"
    },
    "vocabulary": {
      "datatype": "string",
      "description": "The vocabulary to which the concept belongs",
      "collation": "http://marklogic.com/collation/codepoint"
    },
    "domain": {
      "datatype": "string",
      "description": "The domain to which the real world entity the concept pertains",
      "collation": "http://marklogic.com/collation/codepoint"
    },
    "is_standard": {
      "datatype": "boolean",
      "description": "T/F Designated by the OHDSI vocabulary group as a standard concept"
    },
    "concept_class": {
      "datatype": "string",
      "description": "Class to which the concept pertains or belongs as designated by the OHDSI vcabulary group",
      "collation": "http://marklogic.com/collation/codepoint"
    },
    "synonyms": {
      "datatype": "array",
      "description": "0 or more synonyms",
      "items": {
        "datatype": "string",
        "collation": "http://marklogic.com/collation/codepoint"
      }
    },
    "source_concept_code": {
      "datatype": "string",
      "description": "The code from the source vocabulary ",
      "collation": "http://marklogic.com/collation/codepoint"
    },
    "invalid_reason": {
      "datatype": "string",
      "description": "The reason for invalidation if the concept has been invalidated.",
      "collation": "http://marklogic.com/collation/codepoint"
    },
    "valid_start_date": {
      "datatype": "date",
      "description": "The start date of this concept, starts as valid"
    },
    "valid_end_date": {
      "datatype": "date",
      "description": "The date through which this concept is valid. 20991231 is equivalent to currently valid"
    },
    "concept_name": {
      "datatype": "string",
      "description": "The name for the concept",
      "collation": "http://marklogic.com/collation/codepoint"
    }
  }
}
};

export const propertyTableEntities = [
  {
      "entityName": "Concept",
      "entityTypeId": "http://example.org/Concept-1.0.0/Concept",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Concept",
              "version": "1.0.0",
              "baseUri": "http://example.org/"
          },
          "definitions": {
              "Concept": {
                  "primaryKey": "concept_name",
                  "required": [
                      "concept_id",
                      "domain",
                      "concept_name"
                  ],
                  "pii": [
                      "source_concept_code"
                  ],
                  "elementRangeIndex": [
                      "vocabulary",
                      "domain",
                      "is_standard",
                      "invalid_reason"
                  ],
                  "rangeIndex": [],
                  "wordLexicon": ["vocabulary"],
                  "properties": {
                      "concept_id": {
                          "datatype": "unsignedLong",
                          "description": "The CDM-assigned concept id"
                      },
                      "vocabulary": {
                          "datatype": "string",
                          "description": "The vocabulary to which the concept belongs",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "domain": {
                          "datatype": "string",
                          "description": "The domain to which the real world entity the concept pertains",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "is_standard": {
                          "datatype": "boolean",
                          "description": "T/F Designated by the OHDSI vocabulary group as a standard concept"
                      },
                      "concept_class": {
                          "datatype": "string",
                          "description": "Class to which the concept pertains or belongs as designated by the OHDSI vcabulary group",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "synonyms": {
                          "datatype": "array",
                          "description": "0 or more synonyms",
                          "items": {
                              "datatype": "string",
                              "collation": "http://marklogic.com/collation/codepoint"
                          }
                      },
                      "source_concept_code": {
                          "datatype": "string",
                          "description": "The code from the source vocabulary ",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "invalid_reason": {
                          "datatype": "string",
                          "description": "The reason for invalidation if the concept has been invalidated.",
                          "collation": "http://marklogic.com/collation/codepoint"
                      },
                      "valid_start_date": {
                          "datatype": "date",
                          "description": "The start date of this concept, starts as valid"
                      },
                      "valid_end_date": {
                          "datatype": "date",
                          "description": "The date through which this concept is valid. 20991231 is equivalent to currently valid"
                      },
                      "concept_name": {
                          "datatype": "string",
                          "description": "The name for the concept",
                          "collation": "http://marklogic.com/collation/codepoint"
                      }
                  }
              }
          }
      }
  },
  {
      "entityName": "Order",
      "entityTypeId": "http://marklogic.com/example/Order-0.0.1/Order",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Order",
              "version": "0.0.1",
              "baseUri": "http://marklogic.com/example/"
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
                      }
                  }
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
              }
          }
      }
  },
  {
      "entityName": "Customer",
      "entityTypeId": "http://example.org/Customer-0.0.1/Customer",
      "entityInstanceCount": 5,
      "model": {
          "info": {
              "title": "Customer",
              "version": "0.0.1",
              "baseUri": "http://example.org/"
          },
          "definitions": {
            "Customer": {
              "required": [
                "name"
              ],
              "pathRangeIndex": [
                "birthDate",
                "nicknames"
              ],
              "primaryKey": "customerId",
              "properties": {
                "customerId": {
                  "datatype": "integer",
                  "sortable": true
                },
                "name": {
                  "datatype": "string",
                  "collation": "http://marklogic.com/collation/codepoint"
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
                  "facetable": true,
                  "sortable": true
                },
                "status": {
                  "datatype": "string",
                  "facetable": true
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
                }
              }
            },
            "Address": {
              "required": [ ],
              "pii": [ ],
              "elementRangeIndex": [ ],
              "rangeIndex": [ ],
              "wordLexicon": [ ],
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
              "required": [ ],
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
      "latestJobDateTime": "2020-05-13T10:37:00.802231-07:00",
      "latestJobId": "b0ee8653-bf8f-4bbd-956b-9a1471137253"
  }
];

export const entityDefinitionsArray = [
  {
    name: 'Customer',
    primaryKey: 'customerId',
    elementRangeIndex: [],
    pii: [],
    rangeIndex: [],
    required: [],
    wordLexicon: [],
    properties: [
      {
        name: 'customerId',
        datatype: 'integer',
        description: '',
        ref: '',
        collation: '',
        multiple: false
      },
      {
        name: 'name',
        datatype: 'string',
        description: '',
        ref: '',
        collation: 'http://marklogic.com/collation/codepoint',
        multiple: false
      },
      {
        collation: "",
        datatype: "structured",
        description: "Example of a single-value structured property",
        multiple: false,
        name: "billing",
        ref: "#/definitions/Address",
      },
      {
        collation: "",
        datatype: "date",
        description: "",
        multiple: false,
        name: "birthDate",
        ref: ""
      },
      {
        collation: "",
        datatype: "string",
        description: "",
        multiple: false,
        name: "status",
        ref: ""
      },
      {
        collation: "",
        datatype: "date",
        description: "",
        multiple: false,
        name: "customerSince",
        ref: ""
      },
      {
        collation: "",
        datatype: "Order",
        description: "Example of a relationship to another entity type",
        multiple: true,
        name: "orders",
        ref: "http://example.org/Order-0.0.1/Order"
      }
    ]
  },
  {
    name: 'Address',
    primaryKey: '',
    elementRangeIndex: [],
    pii: [],
    rangeIndex: [],
    required: [],
    wordLexicon: [],
    properties: [
      {
        collation: "http://marklogic.com/collation/codepoint",
        datatype: "string",
        description: "",
        multiple: false,
        name: "street",
        ref: ""
      },
      {
        collation: "http://marklogic.com/collation/codepoint",
        datatype: "string",
        description: "",
        multiple: false,
        name: "city",
        ref: ""
      },
      {
        collation: "http://marklogic.com/collation/codepoint",
        datatype: "string",
        description: "",
        multiple: false,
        name: "state",
        ref: ""
      },
      {
        collation: "",
        datatype: "structured",
        description: "",
        multiple: false,
        name: "zip",
        ref: "#/definitions/Zip"
      }
    ]
  },
  {
    name: 'Zip',
    primaryKey: '',
    elementRangeIndex: [],
    pii: [],
    rangeIndex: [],
    required: [],
    wordLexicon: [],
    properties: [
      {
        collation: "http://marklogic.com/collation/codepoint",
        datatype: "string",
        description: "",
        multiple: false,
        name: "fiveDigit",
        ref: ""
      },
      {
        collation: "http://marklogic.com/collation/codepoint",
        datatype: "string",
        description: "",
        multiple: false,
        name: "plusFour",
        ref: ""
      }
    ]
  }
];

export const referencePayloadEmpty = {
  "stepNames": [],
  "entityNames": []
};

export const referencePayloadSteps = {
  "stepNames": ['Order-Load', 'Order-Map'],
  "entityNames": []
};

export const referencePayloadRelationships = {
  "stepNames": [],
  "entityNames": ['Protein']
};

export const referencePayloadStepRelationships = {
  "stepNames": ['Order-Load', 'Order-Map'],
  "entityNames": ['Protein']
};
