declareUpdate();

const defaultPermissions = xdmp.defaultPermissions().concat([xdmp.permission('data-hub-common','read'),xdmp.permission('data-hub-common','update')]);
const helper = require('/test/data-hub-test-helper.xqy');
const test = require('/test/test-helper.xqy');

helper.loadEntities(test['__CALLER_FILE__']);
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