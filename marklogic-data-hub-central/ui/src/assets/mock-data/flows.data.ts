const response = {"data":{"jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}, "status": 200};

let stepFailedWithError = [
    "{\"stack\":\"Error: The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \\n    at main (/data-hub/5/builtins/steps/mapping/entity-services/main.sjs:72:11)\\n    at Flow.runMain (/data-hub/5/impl/flow.sjs:485:12)\\n    at Flow.runStep (/data-hub/5/impl/flow.sjs:343:58)\\n    at Flow.runFlow (/data-hub/5/impl/flow.sjs:211:12)\\n    at post (/marklogic.rest.resource/mlRunFlow/assets/resource.sjs:60:25)\\n    at callExtension (/MarkLogic/rest-api/lib/extensions-util.sjs:93:30)\\n    at applyOnce (/MarkLogic/rest-api/lib/extensions-util.sjs:111:10)\",\"message\":\"The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \",\"name\":\"Error\",\"uri\":\"/test/data/nestedPerson1.json\"}",
    "{\"stack\":\"Error: The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \\n    at main (/data-hub/5/builtins/steps/mapping/entity-services/main.sjs:72:11)\\n    at Flow.runMain (/data-hub/5/impl/flow.sjs:485:12)\\n    at Flow.runStep (/data-hub/5/impl/flow.sjs:343:58)\\n    at Flow.runFlow (/data-hub/5/impl/flow.sjs:211:12)\\n    at post (/marklogic.rest.resource/mlRunFlow/assets/resource.sjs:60:25)\\n    at callExtension (/MarkLogic/rest-api/lib/extensions-util.sjs:93:30)\\n    at applyOnce (/MarkLogic/rest-api/lib/extensions-util.sjs:111:10)\",\"message\":\"The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \",\"name\":\"Error\",\"uri\":\"/test/data/nestedPerson1.json\"}"
];

const jobRespFailedWithError = {
  "data": {
      "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a",
      "flow": "testFlow",
      "user": "dh-dev",
      "lastAttemptedStep": "1",
      "lastCompletedStep": "1",
      "timeStarted": "2020-04-04T01:17:44.918282-07:00",
      "timeEnded": "2020-04-04T01:17:45.012137-07:00",
      "stepResponses": {
          "1": {
              "flowName": "testFlow",
              "stepName": "failedIngest",
              "stepDefinitionName": "default-ingestion",
              "stepDefinitionType": "ingestion",
              "stepOutput": stepFailedWithError,
              "fullOutput": null,
              "status": "completed step 1",
              "totalEvents": 3,
              "successfulEvents": 1,
              "failedEvents": 2,
              "successfulBatches": 1,
              "failedBatches": 2,
              "success": false,
              "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
              "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
          },
          "2": {
              "flowName": "testFlow",
              "stepName": "Mapping1",
              "stepDefinitionName": "entity-services-mapping",
              "stepDefinitionType": "mapping",
              "stepOutput": stepFailedWithError,
              "fullOutput": null,
              "status": "completed step 2",
              "totalEvents": 3,
              "successfulEvents": 1,
              "failedEvents": 2,
              "successfulBatches": 1,
              "failedBatches": 2,
              "success": false,
              "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
              "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
          },
          "4": {
              "flowName": "testFlow",
              "stepName": "match-customer",
              "stepDefinitionName": "default-matching",
              "stepDefinitionType": "matching",
              "stepOutput": stepFailedWithError,
              "fullOutput": null,
              "status": "completed step 4",
              "totalEvents": 3,
              "successfulEvents": 1,
              "failedEvents": 2,
              "successfulBatches": 1,
              "failedBatches": 2,
              "success": false,
              "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
              "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
          },
          "5": {
              "flowName": "testFlow",
              "stepName": "merge-customer",
              "stepDefinitionName": "default-merging",
              "stepDefinitionType": "merging",
              "stepOutput": stepFailedWithError,
              "fullOutput": null,
              "status": "completed step 5",
              "totalEvents": 3,
              "successfulEvents": 1,
              "failedEvents": 2,
              "successfulBatches": 1,
              "failedBatches": 2,
              "success": false,
              "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
              "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
          },
          "6": {
              "flowName": "testFlow",
              "stepName": "master-customer",
              "stepDefinitionName": "default-mastering",
              "stepDefinitionType": "mastering",
              "stepOutput": stepFailedWithError,
              "fullOutput": null,
              "status": "completed step 6",
              "totalEvents": 3,
              "successfulEvents": 1,
              "failedEvents": 2,
              "successfulBatches": 1,
              "failedBatches": 2,
              "success": false,
              "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
              "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
          }
      },
      "jobStatus": "finished_with_errors"
  },
  "status": 200
};

let stepFailed = [
    "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"85edd62b-0e89-4373-80ed-64a144bdb9ba\", binary{\"2d2d38356564643632622d306538392d343337332d383065642d363461313434...\"}) -- Document is not JSON",
    "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"9fed61d9-76ed-45e6-8639-66d8631b61d2\", binary{\"2d2d39666564363164392d373665642d343565362d383633392d363664383633...\"}) -- Document is not JSON",
    "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"8d14ada9-d143-429f-b029-4e254828312f\", binary{\"2d2d38643134616461392d643134332d343239662d623032392d346532353438...\"}) -- Document is not JSON"
];

const jobRespFailed = {
  "data": {
    "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a",
    "flow": "testFlow",
    "user": "dh-dev",
    "lastAttemptedStep": "1",
    "lastCompletedStep": "1",
    "timeStarted": "2020-04-04T01:17:44.918282-07:00",
    "timeEnded": "2020-04-04T01:17:45.012137-07:00",
    "stepResponses": {
      "1": {
        "flowName": "testFlow",
        "stepName": "failedIngest",
        "stepDefinitionName": "default-ingestion",
        "stepDefinitionType": "ingestion",
        "stepOutput": stepFailed
      },
        "2": {
            "flowName": "testFlow",
            "stepName": "Mapping1",
            "stepDefinitionName": "entity-services-mapping",
            "stepDefinitionType": "mapping",
            "stepOutput": stepFailed
        },
        "4": {
            "flowName": "testFlow",
            "stepName": "match-customer",
            "stepDefinitionName": "default-matching",
            "stepDefinitionType": "matching",
            "stepOutput": stepFailed
        },
        "5": {
            "flowName": "testFlow",
            "stepName": "merge-customer",
            "stepDefinitionName": "default-merging",
            "stepDefinitionType": "merging",
            "stepOutput": stepFailed
        },
        "6": {
            "flowName": "testFlow",
            "stepName": "master-customer",
            "stepDefinitionName": "default-mastering",
            "stepDefinitionType": "mastering",
            "stepOutput": stepFailed
        }
    },
    "jobStatus": "failed"
  },
  "status" : 200
};

const loads = {"data" :
    [{
      "name": "failedIngest",
      "description": "",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/failedIngest",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00"
    }],
  "status" :200
};

const primaryEntityTypes = {
  "data": [
    {
      "entityName": "Customer",
      "entityTypeId": "Customer",
      "entityInstanceCount": 0,
      "model": {
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
            "primaryKey": "customerId",
            "properties": {
              "customerId": {
                "datatype": "integer"
              },
              "name": {
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
              },
              "shipping": {
                "$ref": "#/definitions/Address"
              },
              "billing": {
                "$ref": "#/definitions/Address"
              },
              "customerSince": {
                "datatype": "date"
              },
              "orders": {
                "datatype": "array",
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
                "datatype": "string",
                "collation": "http://marklogic.com/collation/codepoint"
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
    }
  ],
  "status":200
};

const mappings = {"data" :
[{
  "entityType": "Customer",
  "entityTypeId":"Customer",
  "artifacts": [
    {
      "name": "Mapping1",
      "targetEntityType": "Customer",
      "description": "",
      "selectedSource": "collection",
      "sourceQuery": "cts.collectionQuery(['default-ingestion'])",
      "properties": {
        "customerId": {
          "sourcedFrom": "PIN"
        }
      },
      "lastUpdated": "2020-04-24T13:21:00.169198-07:00"
    }
  ]
}],
"status" :200
};

const mappingSettings = {"data" :
    {
        "provenanceGranularityLevel": "coarse",
        "batchSize": 50,
        "permissions": "data-hub-common,read,data-hub-common,update",
        "sourceDatabase": "data-hub-STAGING",
        "targetDatabase": "data-hub-FINAL",
        "collections": ["Mapping1", "Customer"],
        "additionalCollections": ['customerCollection'],
        "validateEntity": false,
        "lastUpdated": "2020-05-27T12:19:02.446622-07:00"
    },
    "status" :200
};

const matchings = {"data" :
    [{
      "entityType": "Customer",
      "entityTypeId":"Customer",
      "artifacts": [
        {
          "name": "Matching1",
          "targetEntityType": "Customer",
          "description": "",
          "selectedSource": "collection",
          "sourceQuery": "cts.collectionQuery(['default-mapping'])",
          "lastUpdated": "2020-04-24T13:21:00.169198-07:00"
        }
      ]
    }],
  "status" :200
};

const entityTypes = [
  {
    "entityName": "Customer",
    "entityTypeId": "http://example.com/Customer-0.0.1/Customer",
    "entityInstanceCount": 0,
    "model": {
      "info": {
        "title": "Customer",
        "version": "0.0.1",
        "baseUri": "http://example.com/",
        "description": "An Customer entity"
      },
      "definitions": {
        "Customer": {
          "properties": {
            "FirstName": {
              "datatype": "string",
              "collation": "http://marklogic.com/collation/codepoint"
            }
          }
        }
      }
    }
  }
];

const flows = {
  "data": [{
    "name": "testFlow",
    "description": "",
      "steps": [
          {
              "stepName": "failedIngest",
              "stepDefinitionType": "ingestion",
              "stepNumber": "1",
              "sourceFormat": "json"
          },
          {
            "stepName": "Mapping1",
            "stepDefinitionType": "mapping",
            "stepNumber": "2",
            "targetFormat": "json"
          },
          {
            "stepName": "custom1",
            "stepDefinitionType": "custom",
            "stepNumber": "3",
          },
          {
              "stepNumber":	"4",
              "stepName": "match-customer",
              "stepDefinitionType":	"matching"
          },
          {
              "stepNumber": "5",
              "stepName": "merge-customer",
              "stepDefinitionType": "merging"
          },
          {
              "stepNumber": "6",
              "stepName": "master-customer",
              "stepDefinitionType": "mastering"
          }
      ]
  }]
  ,
  "status" :200
}

const jobRespSuccess = {
  "data": {
    "jobId": "e4590649-8c4b-419c-b6a1-473069186592",
    "flow": "testFlow",
    "user": "dh-dev",
    "lastAttemptedStep": "2",
    "lastCompletedStep": "2",
    "timeStarted": "2020-04-24T14:05:00.31817-07:00",
    "timeEnded": "2020-04-24T14:05:01.019819-07:00",
    "stepResponses": {
      "2": {
        "flowName": "testFlow",
        "stepName": "Mapping1",
        "stepDefinitionName": "entity-services-mapping",
        "stepDefinitionType": "mapping",
      },
      "4": {
          "flowName": "testFlow",
          "stepName": "match-customer",
          "stepDefinitionName": "default-matching",
          "stepDefinitionType": "matching",
      },
      "5": {
          "flowName": "testFlow",
          "stepName": "merge-customer",
          "stepDefinitionName": "default-merging",
          "stepDefinitionType": "merging",
      },
      "6": {
          "flowName": "testFlow",
          "stepName": "master-customer",
          "stepDefinitionName": "default-mastering",
          "stepDefinitionType": "mastering",
      }
    },
    "jobStatus": "finished"
  },
  "status": 200
};

const flowsXML = {
  "data": [{
    "name": "testFlow",
    "description": "",
      "steps": [
          {
              "stepName": "loadXML",
              "stepDefinitionType": "INGESTION",
              "stepNumber": "1",
              "sourceFormat": "xml"
          }
      ]
  }]
  ,
  "status" :200
}

const loadsXML = {"data" :
    [{
      "name": "loadXML",
      "description": "",
      "sourceFormat": "xml",
      "targetFormat": "xml",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/failedIngest",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00"
    }],
  "status" :200
};

const loadSettings = {"data" :
    {
        "provenanceGranularityLevel": "coarse",
        "permissions": "data-hub-operator,read,data-hub-operator,update",
        "targetFormat": "json",
        "targetDatabase": "data-hub-STAGING",
        "collections": [
          "testLoad"
        ],
        "additionalCollections": [],
        "lastUpdated": "2020-05-27T12:19:02.446622-07:00"
    },
    "status" :200
};

const data = {
    primaryEntityTypes,
    flows: flows,
    entityTypes: entityTypes,
    response: response,
    loads: loads,
    mappings: mappings,
    matchings: matchings,
    jobRespFailedWithError: jobRespFailedWithError,
    jobRespFailed: jobRespFailed,
    jobRespSuccess: jobRespSuccess,
    flowsXML: flowsXML,
    loadsXML: loadsXML,
    loadSettings: loadSettings,
    mappingSettings: mappingSettings
};

export default data;
