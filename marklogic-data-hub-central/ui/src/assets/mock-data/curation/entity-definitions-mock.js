export const customerEntityDef = {
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
};

export const personEntityDef = {
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
};

export const personNestedEntityDef = {
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
};

export const personNestedEntityDefSameNames = {
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
};

export const customerNestedEntityDef = {
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
};