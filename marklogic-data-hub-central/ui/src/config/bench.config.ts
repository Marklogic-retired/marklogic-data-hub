const response = {"data":{"jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}, "status": 200};
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
        "stepOutput": [
          "{\"stack\":\"Error: The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \\n    at main (/data-hub/5/builtins/steps/mapping/entity-services/main.sjs:72:11)\\n    at Flow.runMain (/data-hub/5/impl/flow.sjs:485:12)\\n    at Flow.runStep (/data-hub/5/impl/flow.sjs:343:58)\\n    at Flow.runFlow (/data-hub/5/impl/flow.sjs:211:12)\\n    at post (/marklogic.rest.resource/mlRunFlow/assets/resource.sjs:60:25)\\n    at callExtension (/MarkLogic/rest-api/lib/extensions-util.sjs:93:30)\\n    at applyOnce (/MarkLogic/rest-api/lib/extensions-util.sjs:111:10)\",\"message\":\"The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \",\"name\":\"Error\",\"uri\":\"/test/data/nestedPerson1.json\"}",
          "{\"stack\":\"Error: The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \\n    at main (/data-hub/5/builtins/steps/mapping/entity-services/main.sjs:72:11)\\n    at Flow.runMain (/data-hub/5/impl/flow.sjs:485:12)\\n    at Flow.runStep (/data-hub/5/impl/flow.sjs:343:58)\\n    at Flow.runFlow (/data-hub/5/impl/flow.sjs:211:12)\\n    at post (/marklogic.rest.resource/mlRunFlow/assets/resource.sjs:60:25)\\n    at callExtension (/MarkLogic/rest-api/lib/extensions-util.sjs:93:30)\\n    at applyOnce (/MarkLogic/rest-api/lib/extensions-util.sjs:111:10)\",\"message\":\"The given date pattern (null) is not supported.: /*:stylesheet/*:template[4] <xsl:for-each select=\\\"/\\\"> <xsl:call-template name=\\\"Purchase\\\"/></xsl:for-each> -- \",\"name\":\"Error\",\"uri\":\"/test/data/nestedPerson1.json\"}"
        ],
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
      }
    },
    "jobStatus": "finished_with_errors"
  },
  "status" : 200
};

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
        "stepOutput": [
          "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"85edd62b-0e89-4373-80ed-64a144bdb9ba\", binary{\"2d2d38356564643632622d306538392d343337332d383065642d363461313434...\"}) -- Document is not JSON",
          "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"9fed61d9-76ed-45e6-8639-66d8631b61d2\", binary{\"2d2d39666564363164392d373665642d343565362d383633392d363664383633...\"}) -- Document is not JSON",
          "Local message: failed to apply resource at documents: Bad Request. Server Message: XDMP-JSONDOC: xdmp:multipart-decode(\"8d14ada9-d143-429f-b029-4e254828312f\", binary{\"2d2d38643134616461392d643134332d343239662d623032392d346532353438...\"}) -- Document is not JSON"
        ],
        "fullOutput": null,
        "status": "completed step 2",
        "totalEvents": 3,
        "successfulEvents": 0,
        "failedEvents": 3,
        "successfulBatches": 0,
        "failedBatches": 3,
        "success": false,
        "stepStartTime": "2020-04-04T01:17:44.936121-07:00",
        "stepEndTime": "2020-04-04T01:17:45.012137-07:00"
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
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
      "fileCount": 1,
      "filesNeedReuploaded": false
    }],
  "status" :200
};

const mappings = {"data" :
[{
  "entityType": "Customer",
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

const flows = {
  "data": [{
    "name": "testFlow",
    "description": "",
    "batchSize": 100,
    "threadCount": 4,
    "stopOnError": false,
    "options": {},
    "version": 0,
    "steps": {
      "1": {
        "name": "failedIngest",
        "description": "",
        "options": {
          "sourceQuery": null,
          "collections": ["failedIngest"],
          "loadData": {
            "name": "failedIngest"
          },
          "outputFormat": "json",
          "targetDatabase": "data-hub-STAGING"
        },
        "customHook": {},
        "retryLimit": 0,
        "batchSize": 0,
        "threadCount": 0,
        "stepDefinitionName": "default-ingestion",
        "stepDefinitionType": "INGESTION"
      }
    }
  }]
  ,
  "status" :200
}

const flowsWithMapping = {
  "data": [{
    "name": "Flow1",
    "description": "",
    "batchSize": 100,
    "threadCount": 4,
    "stopOnError": false,
    "options": {},
    "version": 0,
    "steps": {
      "1": {
        "name": "Mapping1",
        "description": "",
        "options": {
          "mapping": {
            "name": "Mapping1"
          }
        },
        "customHook": {},
        "retryLimit": 0,
        "batchSize": 0,
        "threadCount": 0,
        "stepDefinitionName": "entity-services-mapping",
        "stepDefinitionType": "MAPPING"
      }
    }
  }]
  ,
  "status" :200
}

const responseForMapping = {
  "data": {
    "jobId": "e4590649-8c4b-419c-b6a1-473069186592",
    "flow": "Flow1",
  }, 
  "status": 200
};

const jobRespSuccess = {
  "data": {
    "jobId": "e4590649-8c4b-419c-b6a1-473069186592",
    "flow": "Flow1",
    "user": "dh-dev",
    "lastAttemptedStep": "1",
    "lastCompletedStep": "1",
    "timeStarted": "2020-04-24T14:05:00.31817-07:00",
    "timeEnded": "2020-04-24T14:05:01.019819-07:00",
    "stepResponses": {
      "1": {
        "flowName": "Flow1",
        "stepName": "Mapping1",
        "stepDefinitionName": "entity-services-mapping",
        "stepDefinitionType": "mapping",
        "stepOutput": null,
        "fullOutput": null,
        "status": "completed step 1",
        "totalEvents": 0,
        "successfulEvents": 0,
        "failedEvents": 0,
        "successfulBatches": 0,
        "failedBatches": 0,
        "success": true,
        "stepStartTime": "2020-04-24T14:05:00.35012-07:00",
        "stepEndTime": "2020-04-24T14:05:01.019819-07:00"
      }
    },
    "jobStatus": "finished"
  },
  "status": 200
};

const flowsJSON = {
  "data": [{
    "name": "testFlow",
    "description": "",
    "batchSize": 100,
    "threadCount": 4,
    "stopOnError": false,
    "options": {},
    "version": 0,
    "steps": {
      "1": {
        "name": "loadJSON",
        "description": "",
        "options": {
          "sourceQuery": null,
          "collections": ["loadJSON"],
          "loadData": {
            "name": "loadJSON"
          },
          "outputFormat": "json",
          "targetDatabase": "data-hub-STAGING"
        },
        "customHook": {},
        "retryLimit": 0,
        "batchSize": 0,
        "threadCount": 0,
        "stepDefinitionName": "default-ingestion",
        "stepDefinitionType": "INGESTION"
      }
    }
  }]
  ,
  "status" :200
}

const flowsXML = {
  "data": [{
    "name": "testFlow",
    "description": "",
    "batchSize": 100,
    "threadCount": 4,
    "stopOnError": false,
    "options": {},
    "version": 0,
    "steps": {
      "1": {
        "name": "loadXML",
        "description": "",
        "options": {
          "sourceQuery": null,
          "collections": ["loadXML"],
          "loadData": {
            "name": "loadXML"
          },
          "outputFormat": "json",
          "targetDatabase": "data-hub-STAGING"
        },
        "customHook": {},
        "retryLimit": 0,
        "batchSize": 0,
        "threadCount": 0,
        "stepDefinitionName": "default-ingestion",
        "stepDefinitionType": "INGESTION"
      }
    }
  }]
  ,
  "status" :200
}

const loadsJSON = {"data" :
    [{
      "name": "loadJSON",
      "description": "",
      "sourceFormat": "json",
      "targetFormat": "json",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/failedIngest",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
      "fileCount": 1,
      "filesNeedReuploaded": false
    }],
  "status" :200
};

const loadsXML = {"data" :
    [{
      "name": "loadXML",
      "description": "",
      "sourceFormat": "xml",
      "targetFormat": "xml",
      "outputURIReplacement": "",
      "inputFilePath": "/xml-test/data-sets/failedIngest",
      "lastUpdated": "2020-04-02T23:08:28.287065-07:00",
      "fileCount": 1,
      "filesNeedReuploaded": false
    }],
  "status" :200
};

const data = {
    flows: flows,
    flowsWithMapping: flowsWithMapping,
    response: response,
    responseForMapping: responseForMapping,
    loads: loads,
    mappings: mappings,
    jobRespFailedWithError: jobRespFailedWithError,
    jobRespFailed: jobRespFailed,
    jobRespSuccess: jobRespSuccess,
    flowsJSON: flowsJSON,
    flowsXML: flowsXML,
    loadsJSON: loadsJSON,
    loadsXML: loadsXML
};

export default data;
