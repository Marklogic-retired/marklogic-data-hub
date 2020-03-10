declareUpdate();

// Nested ObjectType entity model
xdmp.documentInsert("/entities/EntitiesSearchEntity.entity.json",
    {
      "info": {
        "title": "EntitiesSearchEntity",
        "version": "0.0.1",
        "baseUri": "http://marklogic.com/"
      },
      "definitions": {
        "EntitiesSearchEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "srchEntyProp1"
          ],
          "rangeIndex": [
            "srchEntyProp2"
          ],
          "wordLexicon": [],
          "properties": {
            "srchEntyProp1": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "srchEntyProp2": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "numStrEntityProp": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/NumStringEntity"
              }
            }
          }
        },
        "NumericEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "decimalProp",
            "floatProp",
            "doubleProp"
          ],
          "rangeIndex": [
            "intProp",
            "longProp"
          ],
          "wordLexicon": [],
          "properties": {
            "intProp": {
              "datatype": "int"
            },
            "longProp": {
              "datatype": "long"
            },
            "decimalProp": {
              "datatype": "decimal"
            },
            "floatProp": {
              "datatype": "float"
            },
            "doubleProp": {
              "datatype": "double"
            }
          }
        },
        "NumStringEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "strNameProp"
          ],
          "rangeIndex": [
            "strCityProp",
            "intProp"
          ],
          "wordLexicon": [],
          "properties": {
            "strNameProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "strCityProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "intProp": {
              "datatype": "int"
            },
            "numEntProp": {
              "$ref": "#/definitions/NumericEntity"
            }
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
      collections: "http://marklogic.com/entity-services/models"
    });
