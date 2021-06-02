export const customerEntityDef = [{
  "entityModel": {
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
        "pii": ["ssn"],
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
          "ssn": {
            "datatype": "string"
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
}];

export const customerEntityDefWithLargePropCount = [{
  "entityModel": {
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
        "pii": ["ssn"],
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
          "ssn": {
            "datatype": "string"
          },
          "testProp1": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp2": {
            "datatype": "string"
          },
          "testProp3": {
            "datatype": "string"
          },
          "testProp4": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp5": {
            "datatype": "string"
          },
          "testProp6": {
            "datatype": "string"
          },
          "testProp7": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp8": {
            "datatype": "string"
          },
          "testProp9": {
            "datatype": "string"
          },
          "testProp10": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp11": {
            "datatype": "string"
          },
          "testProp12": {
            "datatype": "string"
          },
          "testProp13": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp14": {
            "datatype": "string"
          },
          "testProp15": {
            "datatype": "string"
          },
          "testProp16": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp17": {
            "datatype": "string"
          },
          "testProp18": {
            "datatype": "string"
          },
          "testProp19": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp20": {
            "datatype": "string"
          },
          "testProp21": {
            "datatype": "string"
          },
          "testProp22": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp23": {
            "datatype": "string"
          },
          "testProp24": {
            "datatype": "string"
          },
          "testProp25": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp26": {
            "datatype": "string"
          },
          "testProp27": {
            "datatype": "string"
          },
          "testProp28": {
            "datatype": "integer",
            "sortable": true
          },
          "testProp29": {
            "datatype": "string"
          },
          "testProp30": {
            "datatype": "string"
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
}];

export const personEntityDef = [{
  "entityType": "Person",
  "mappingTitle": "Person",
  "entityModel": {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Person": {
        "required": [
          "propId"
        ],
        "primaryKey": "propId",
        "properties": {
          "propId": {
            "datatype": "integer",
            "sortable": true
          },
          "propName": {
            "datatype": "string"
          },
          "propAttribute": {
            "datatype": "string"
          },
          "items": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/ItemType"
            },
            "subProperties": {
              "itemTypes": {
                "datatype": "string"
              },
              "itemCategory": {
                "datatype": "object",
                "$ref": "#/definitions/catItem",
                "subProperties": {
                  "artCraft": {
                    "datatype": "string"
                  },
                  "automobile": {
                    "datatype": "string"
                  }
                }
              }
            }
          },
          "gender": {
            "datatype": "string"
          },
        }
      }
    }
  }
}];

export const personNestedEntityDef = [{
  "entityModel": {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Person": {
        "required": [
          "propId"
        ],
        "primaryKey": "propId",
        "properties": {
          "propId": {
            "datatype": "integer",
            "sortable": true
          },
          "propName": {
            "datatype": "string"
          },
          "propAttribute": {
            "datatype": "string"
          },
          "items": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/ItemType"
            },
            "subProperties": {
              "itemTypes": {
                "datatype": "string"
              },
              "itemCategory": {
                "datatype": "object",
                "$ref": "#/definitions/catItem",
                "subProperties": {
                  "artCraft": {
                    "datatype": "string"
                  },
                  "automobile": {
                    "datatype": "string"
                  }
                }
              },
              "productCategory": {
                "datatype": "object",
                "$ref": "#/definitions/catProduct",
                "subProperties": {
                  "speedometer": {
                    "datatype": "string"
                  },
                  "windscreen": {
                    "datatype": "string"
                  }
                }
              }
            }
          },
          "gender": {
            "datatype": "string"
          },
        }
      }
    }
  }
}];

export const personNestedEntityDefSameNames = [{
  "entityModel": {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Person": {
        "required": [
          "propId"
        ],
        "primaryKey": "propId",
        "properties": {
          "propId": {
            "datatype": "integer",
            "sortable": true
          },
          "propName": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/propNameCat"
            },
            "subProperties": {
              "propName": {
                "datatype": "array",
                "items": {
                  "$ref": "#/definitions/propCat"
                },
                "subProperties": {
                  "propName": {
                    "datatype": "string"
                  },
                  "propPrefix": {
                    "datatype": "string"
                  }
                }
              }
            }
          },
          "propAttribute": {
            "datatype": "string"
          },
          "items": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/items"
            },
            "subProperties": {
              "itemTypes": {
                "datatype": "string"
              },
              "itemCategory": {
                "datatype": "array",
                "items": {
                  "$ref": "#/definitions/catItem"
                },
                "subProperties": {
                  "artCraft": {
                    "datatype": "string"
                  },
                  "automobile": {
                    "datatype": "string"
                  }
                }
              },
              "productCategory": {
                "datatype": "array",
                "items": {
                  "$ref": "#/definitions/catProduct"
                },
                "subProperties": {
                  "speedometer": {
                    "datatype": "string"
                  },
                  "windscreen": {
                    "datatype": "string"
                  }
                }
              }
            }
          },
          "gender": {
            "datatype": "string"
          },
        }
      }
    }
  }
}];

export const personRelatedEntityDef = [{
  "entityType": "Person",
  "mappingTitle": "Person",
  "relatedEntityMappings": [{
    "mappingLinkText": "Order (orderedBy Person)",
    "entityMappingId": "Person.items:Order",
    "additionalCollections": [],
    "collections": ["Order"]
  },
  {
    "mappingLinkText": "BabyRegistry (ownedBy Person)",
    "entityMappingId": "Person.items:BabyRegistry"
  }
  ],
  "entityModel": {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Person": {
        "required": [
          "propId"
        ],
        "primaryKey": "propId",
        "properties": {
          "propId": {
            "datatype": "integer",
            "sortable": true
          },
          "propName": {
            "datatype": "string"
          },
          "propAttribute": {
            "datatype": "string"
          },
          "items": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/ItemType"
            },
            "subProperties": {
              "itemTypes": {
                "datatype": "string"
              },
              "itemCategory": {
                "datatype": "object",
                "$ref": "#/definitions/catItem",
                "subProperties": {
                  "artCraft": {
                    "datatype": "string"
                  },
                  "automobile": {
                    "datatype": "string"
                  }
                }
              }
            }
          },
          "gender": {
            "datatype": "string"
          },
        }
      }
    }
  }
},
{
  "entityType": "Order",
  "mappingTitle": "Order (orderedBy Person)",
  "relatedEntityMappings": [{
    "mappingLinkText": "hasProduct Product",
    "entityMappingId": "Person.items:Order.lineItem.orderIncludes:Product"
  }],
  "entityMappingId": "Person.items:Order",
  "entityModel": {
    "info": {
      "title": "Order",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/example/"
    },
    "definitions": {
      "Order": {
        "primaryKey": "orderId",
        "properties": {
          "orderId": {
            "datatype": "integer"
          },
          "orderDateTime": {
            "datatype": "dateTime"
          },
          "orderedBy": {
            "datatype": "integer",
            "relatedEntityType": "http://example.org/Person-0.0.1/Person",
            "joinPropertyName": "items"
          },
          "deliveredTo": {
            "datatype": "integer"
          },
          "lineItems": {
            "datatype": "array",
            "items": {
              "$ref": "#/definitions/LineItem"
            },
            "subProperties": {
              "quantity": {
                "datatype": "integer"
              },
              "hasProduct": {
                "datatype": "integer",
                "relatedEntityType": "http://example.org/Product-0.0.1/Product",
                "joinPropertyName": "productId"
              }
            }
          }
        }
      }
    }
  }
},
{
  "entityType": "Product",
  "entityMappingId": "Person.items:Order.lineItem.orderIncludes:Product",
  "mappingTitle": "Product (Order hasProduct)",
  "entityModel": {
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
          }
        }
      }
    }
  }
},
{
  "entityType": "BabyRegistry",
  "entityMappingId": "Person.items:BabyRegistry",
  "mappingTitle": "BabyRegistry (ownedBy Person)",
  "relatedEntityMappings": [{
    "mappingLinkText": "includes Product",
    "entityMappingId": "Person.items:BabyRegistry.hasProduct:Product"
  }],
  "entityModel": {
    "info": {
      "title": "BabyRegistry",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/example/"
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
            "relatedEntityType": "http://example.org/",
            "joinPropertyName": "items"
          },
          "hasProduct": {
            "datatype": "array",
            "items": {
              "datatype": "integer",
              "relatedEntityType": "http://example.org/Product-0.0.1/Product",
              "joinPropertyName": "productId"
            }
          }
        }
      }
    }
  }
},
{
  "entityType": "Product",
  "mappingTitle": "Product (BabyRegistry hasProduct)",
  "entityMappingId": "Person.items:BabyRegistry.hasProduct:Product",
  "entityModel": {
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
          }
        }
      }
    }
  }
}
];

export const customerNestedEntityDef = [{
  "entityModel": {
    "info": {
      "title": "Customer",
      "version": "0.0.1",
      "baseUri": "http://example.org/"
    },
    "definitions": {
      "Customer": {
        "primaryKey": "customerId",
        "required": [
          "name"
        ],
        "pii": [
          "pin"
        ],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
          "customerId": {
            "datatype": "integer"
          },
          "name": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2"
          },
          "email": {
            "datatype": "string",
            "description": "This has a case-insensitive collation for the match queries that use range indexes",
            "collation": "http://marklogic.com/collation//S2"
          },
          "pin": {
            "datatype": "integer"
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
            "datatype": "date"
          },
          "status": {
            "datatype": "string"
          },
          "customerSince": {
            "datatype": "date"
          }
        }
      }
    }
  }
}];