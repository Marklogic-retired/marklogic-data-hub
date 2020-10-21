xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub();

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-entities($test:__CALLER_FILE__);

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__);

xquery version "1.0-ml";
xdmp:collection-delete("http://marklogic.com/data-hub/saved-query");

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $default-permissions := (
  xdmp:default-permissions((),'objects'),xdmp:permission('data-hub-common','read','object'),xdmp:permission('data-hub-common','update','object')
);
(: Inserting documents into final database :)
(: Do not add commas to the values in these documents as it may break the simple CSV parser used for testing export :)
xdmp:document-insert("/exp/doc1",
    xdmp:unquote('{
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
    }'),
    map:map()
      => map:with("permissions", $default-permissions)
      => map:with("collections", "doc1")
      => map:with("metadata",
        map:map()
          => map:with("datahubCreatedInFlow", "my-flow-1")
          => map:with("datahubCreatedByStep", "my-step-1")

        )
    ),
xdmp:document-insert("/exp/doc2",
    xdmp:unquote('{
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
    }'),
    map:map()
      => map:with("permissions", $default-permissions)
      => map:with("collections", "doc2")
      => map:with("metadata",
        map:map()
          => map:with("datahubCreatedInFlow", "my-flow-2")
          => map:with("datahubCreatedByStep", "my-step-2")
        ));
