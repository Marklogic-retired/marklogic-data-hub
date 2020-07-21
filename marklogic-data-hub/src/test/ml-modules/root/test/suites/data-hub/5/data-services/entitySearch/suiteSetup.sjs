declareUpdate();

const defaultPermissions = xdmp.defaultPermissions().concat([xdmp.permission('data-hub-common','read')]);

// Inserting documents into final database
xdmp.documentInsert("/exp/doc1",
    {
      "envelope": {
        "headers": {
          "sources": [
            {
              "name": "SearchEntitiesFlow"
            }
          ],
          "createdOn": "2020-02-21T12:35:03.283648-08:00",
          "createdBy": "admin"
        },
        "triples": [],
        "instance": {
          "info": {
            "title": "EntitySearchEntity",
            "version": "0.0.1",
            "baseUri": "http://marklogic.com/"
          },
          "EntitySearchEntity": {
            "numericStringEntityProp": [
              {
                "NumericStringEntity": {
                  "stringNameProp": "doc1Name1Prop",
                  "stringCityProp": "doc1City1Prop",
                  "intProp": 1,
                  "numericEntityProp": {
                    "NumericEntity": {
                      "intProp": 11,
                      "longProp": 110,
                      "floatProp": 10000,
                      "doubleProp": 100000,
                      "decimalProp": 1000.5
                    }
                  }
                }
              },
              {
                "NumericStringEntity": {
                  "stringNameProp": "doc1Name2Prop",
                  "stringCityProp": "doc1City2Prop",
                  "intProp": 2,
                  "numericEntityProp": {
                    "NumericEntity": {
                      "intProp": 57,
                      "longProp": 157,
                      "floatProp": 15577,
                      "doubleProp": 155577,
                      "decimalProp": 1557.5
                    }
                  }
                }
              }
            ],
            "searchEntityProp2": "doc1SrchEntyProp2",
            "searchEntityProp1": "doc1SrchEntyProp1",
            "hyphenated-property": "doc1HyphenatedProp"
          }
        }
      }
    },
    {
      permissions: defaultPermissions,
      collections: "doc1",
      metadata: {
        "datahubCreatedInFlow": "my-flow-1",
        "datahubCreatedByStep": "my-step-1"
      }
    });

xdmp.documentInsert("/exp/doc2",
    {
      "envelope": {
        "headers": {
          "sources": [
            {
              "name": "SearchEntitiesFlow"
            }
          ],
          "createdOn": "2020-02-21T12:35:03.283648-08:00",
          "createdBy": "admin"
        },
        "triples": [],
        "instance": {
          "info": {
            "title": "EntitySearchEntity",
            "version": "0.0.1",
            "baseUri": "http://marklogic.com/"
          },
          "EntitySearchEntity": {
            "numericStringEntityProp": [
              {
                "NumericStringEntity": {
                  "stringNameProp": "doc2Name1Prop",
                  "stringCityProp": "doc2City1Prop",
                  "intProp": 1,
                  "numericEntityProp": {
                    "NumericEntity": {
                      "intProp": 21,
                      "longProp": 210,
                      "floatProp": 20000,
                      "doubleProp": 200000,
                      "decimalProp": 2000.5
                    }
                  }
                }
              },
              {
                "NumericStringEntity": {
                  "stringNameProp": "doc2Name2Prop",
                  "stringCityProp": "doc2City2Prop",
                  "intProp": 2,
                  "numericEntityProp": {
                    "NumericEntity": {
                      "intProp": 77,
                      "longProp": 757,
                      "floatProp": 75577,
                      "doubleProp": 755577,
                      "decimalProp": 7557.5
                    }
                  }
                }
              }
            ],
            "searchEntityProp2": "doc2SrchEntyProp2",
            "searchEntityProp1": "doc2SrchEntyProp1",
            "hyphenated-property": "doc2HyphenatedProp"
          }
        }
      }
    },
    {
      permissions: defaultPermissions,
      collections: "doc2",
      metadata: {
        "datahubCreatedInFlow": "my-flow-2",
        "datahubCreatedByStep": "my-step-2"
      }
    });

// Inserting entity model documents into final database
xdmp.documentInsert("/entities/NumericEntity.entity.json",
    {
      "info": {
        "title": "NumericEntity",
        "version": "0.0.1",
        "baseUri": "http://marklogic.com/"
      },
      "definitions": {
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
        }
      }
    },
    {
      permissions: defaultPermissions,
      collections: "http://marklogic.com/entity-services/models"
    });

xdmp.documentInsert("/entities/NumericStringEntity.entity.json",
    {
      "info": {
        "title": "NumericStringEntity",
        "version": "0.0.1",
        "baseUri": "http://marklogic.com/"
      },
      "definitions": {
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
        "NumericStringEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "stringNameProp"
          ],
          "rangeIndex": [
            "stringCityProp",
            "intProp"
          ],
          "wordLexicon": [],
          "properties": {
            "stringNameProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "stringCityProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "intProp": {
              "datatype": "int"
            },
            "numericEntityProp": {
              "$ref": "#/definitions/NumericEntity"
            }
          }
        }
      }
    },
    {
      permissions: defaultPermissions,
      collections: "http://marklogic.com/entity-services/models"
    });

xdmp.documentInsert("/entities/EntitySearchEntity.entity.json",
    {
      "info": {
        "title": "EntitySearchEntity",
        "version": "0.0.1",
        "baseUri": "http://marklogic.com/"
      },
      "definitions": {
        "EntitySearchEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "searchEntityProp1"
          ],
          "rangeIndex": [
            "searchEntityProp2"
          ],
          "wordLexicon": [],
          "properties": {
            "searchEntityProp1": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "searchEntityProp2": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "hyphenated-property": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "numericStringEntityProp": {
              "datatype": "array",
              "items": {
                "$ref": "#/definitions/NumericStringEntity"
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
        "NumericStringEntity": {
          "required": [],
          "pii": [],
          "elementRangeIndex": [
            "stringNameProp"
          ],
          "rangeIndex": [
            "stringCityProp",
            "intProp"
          ],
          "wordLexicon": [],
          "properties": {
            "stringNameProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "stringCityProp": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            },
            "intProp": {
              "datatype": "int"
            },
            "numericEntityProp": {
              "$ref": "#/definitions/NumericEntity"
            }
          }
        }
      }
    },
    {
      permissions: defaultPermissions,
      collections: "http://marklogic.com/entity-services/models"
    });