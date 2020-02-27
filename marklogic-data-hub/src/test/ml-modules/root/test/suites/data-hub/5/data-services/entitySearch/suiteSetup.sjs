declareUpdate();

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
            "title": "EntitiesSearchEntity",
            "version": "0.0.1",
            "baseUri": "http://marklogic.com/"
          },
          "EntitiesSearchEntity": {
            "numStrEntityProp": [
              {
                "NumStringEntity": {
                  "strNameProp": "doc1Name1Prop",
                  "strCityProp": "doc1City1Prop",
                  "intProp": 1,
                  "numEntProp": {
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
                "NumStringEntity": {
                  "strNameProp": "doc1Name2Prop",
                  "strCityProp": "doc1City2Prop",
                  "intProp": 2,
                  "numEntProp": {
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
            "srchEntyProp2": "doc1SrchEntyProp2",
            "srchEntyProp1": "doc1SrchEntyProp1"
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
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
            "title": "EntitiesSearchEntity",
            "version": "0.0.1",
            "baseUri": "http://marklogic.com/"
          },
          "EntitiesSearchEntity": {
            "numStrEntityProp": [
              {
                "NumStringEntity": {
                  "strNameProp": "doc2Name1Prop",
                  "strCityProp": "doc2City1Prop",
                  "intProp": 1,
                  "numEntProp": {
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
                "NumStringEntity": {
                  "strNameProp": "doc2Name2Prop",
                  "strCityProp": "doc2City2Prop",
                  "intProp": 2,
                  "numEntProp": {
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
            "srchEntyProp2": "doc2SrchEntyProp2",
            "srchEntyProp1": "doc2SrchEntyProp1"
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
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
      permissions: xdmp.defaultPermissions(),
      collections: "http://marklogic.com/entity-services/models"
    });

xdmp.documentInsert("/entities/NumStringEntity.entity.json",
    {
      "info": {
        "title": "NumStringEntity",
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