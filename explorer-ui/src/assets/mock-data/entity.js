const exampleEntity = 
  {
    "definitions": {
      "Admissions": {
        "$id": "#/definitions/Admissions",
        "required": [],
        "pii": [],
        "elementRangeIndex": [
          "AdmissionID"
        ],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
          "AdmissionID": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "startdate": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "enddate": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "labs": {
            "items": {
              "type": "object",
              "properties": {
                "Labs": {
                  "$ref": "#/definitions/Labs",
                  "type": "array"
                }
              }
            },
            "type": "array"
          },
          "diagnoses": {
            "items": {
              "type": "object",
              "properties": {
                "Diagnoses": {
                  "$ref": "#/definitions/Diagnoses",
                  "type": "array"
                }
              }
            },
            "type": "array"
          }
        }
      },
      "Diagnoses": {
        "$id": "#/definitions/Diagnoses",
        "required": [],
        "pii": [],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
          "primaryDiagnosisCode": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "primaryDiagnosisDescription": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          }
        }
      },
      "Labs": {
        "$id": "#/definitions/Labs",
        "required": [],
        "pii": [],
        "elementRangeIndex": [],
        "rangeIndex": [],
        "wordLexicon": [],
        "properties": {
          "name": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "value": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "units": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          },
          "datetime": {
            "collation": "http://marklogic.com/collation/codepoint",
            "type": "string"
          }
        }
      }
    },
    "language": "zxx",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.org/Admissions",
    "properties": {
      "Admissions": {
        "$ref": "#/definitions/Admissions"
      }
    }
  }

export default exampleEntity;