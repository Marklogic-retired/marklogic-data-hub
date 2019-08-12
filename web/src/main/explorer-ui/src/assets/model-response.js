const modelResponse = [
  {
    "uri": "/entities/Admissions.entity.json",
    "docs": {
      "info": {
        "title": "Admissions",
        "version": "0.0.1",
        "baseUri": "http://www.example.org/"
      },
      "definitions": {
        "Labs": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "name": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "value": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "units": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "datetime": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        },
        "Admissions": {
          "required": ["AdmissionID", "labs"],
          "pii": [],
          "elementRangeIndex": [
            "AdmissionID"
          ],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "AdmissionID": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "startdate": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "enddate": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "labs": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Labs"
              }
            },
            "diagnoses": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Diagnoses"
              }
            }
          }
        },
        "Diagnoses": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "primaryDiagnosisCode": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "primaryDiagnosisDescription": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  },
  {
    "uri": "/entities/Labs.entity.json",
    "docs": {
      "info": {
        "title": "Labs",
        "version": "0.0.1",
        "baseUri": "http://example.org/",
        "description": "Labs that were run"
      },
      "definitions": {
        "Labs": {
          "required": [],
          "pii": ["name"],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": ["units"],
          "properties": {
            "name": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "value": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "units": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "datetime": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  },
  {
    "uri": "/entities/Diagnoses.entity.json",
    "docs": {
      "info": {
        "title": "Diagnoses",
        "version": "0.0.1",
        "baseUri": "http://example.org/"
      },
      "definitions": {
        "Diagnoses": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "primaryDiagnosisCode": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "primaryDiagnosisDescription": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  },
  {
    "uri": "/entities/Patients.entity.json",
    "docs": {
      "info": {
        "title": "Patients",
        "version": "0.0.1",
        "baseUri": "http://example.org/",
        "description": "Patient Model"
      },
      "definitions": {
        "Labs": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "name": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "value": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "units": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "datetime": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        },
        "Admissions": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "AdmissionID"
          ],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "AdmissionID": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "startdate": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "enddate": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "labs": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Labs"
              }
            },
            "diagnoses": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Diagnoses"
              }
            }
          }
        },
        "Patients": {
          "required": ["PatientID"],
          "pii": ["PatientID"],
          "elementRangeIndex": [
            "PatientID",
            "race"
          ],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "PatientID": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "gender": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "dob": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "race": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "marital-status": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "language": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "percentagebelowpoverty": {
              "datatype": "decimal"
            },
            "admissions": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/Admissions"
              }
            }
          }
        },
        "Diagnoses": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "properties": {
            "primaryDiagnosisCode": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "primaryDiagnosisDescription": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  }
]

export default modelResponse;