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
};