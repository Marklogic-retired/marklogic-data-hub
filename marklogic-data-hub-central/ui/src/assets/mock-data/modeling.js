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
}

export const createModelErrorResponse = {
  "code": 400,
  "message": "An entity type already exists with a name of Testing",
  "suggestion": "Resend the request in the correct format.",
  "details": "An entity type already exists with a name of Testing"
}

export const getEntityTypes = [
  {
      "entityName": "AnotherModel",
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
      "entityInstanceCount": 2384,
      "model": {
          "info": {
              "title": "Order",
              "version": "0.0.1",
              "baseUri": "http://demo51.org/",
              "description": "inde"
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
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Protein",
              "version": "0.0.1",
              "baseUri": "http://marklogic.com/data-hub/example/"
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
                      }
                  }
              }
          }
      }
  },
  {
      "entityName": "Product",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Product",
              "version": "0.0.1",
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
                      }
                  }
              }
          }
      }
  },
  {
      "entityName": "Provider",
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "Provider",
              "version": "0.0.1",
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
      "entityInstanceCount": 0,
      "model": {
          "info": {
              "title": "TestEntityForMapping",
              "version": "0.0.1",
              "baseUri": "http://example.com/",
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
      "entityInstanceCount": 1000,
      "model": {
          "info": {
              "title": "Customer",
              "version": "0.0.1",
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
]

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
}