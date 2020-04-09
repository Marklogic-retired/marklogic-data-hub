import {IRolesContextInterface} from "../util/roles";

class MockRolesService implements IRolesContextInterface{
  public roles: string[] = [];

  public setRoles: (roles: string[]) => void = (roles: string[]) => {
    this.roles = roles;
  };
  public canReadMappings:() => boolean = () => {
    return false;
  };
  public canWriteMappings:() => boolean = () => {
    return false;
  };
  public canReadMatchMerge:() => boolean = () => {
    return false;
  };
  public canWriteMatchMerge:() => boolean = () => {
    return false;
  };
  public canReadLoadData:() => boolean = () => {
    return true;
  };
  public canWriteLoadData:() => boolean = () => {
    return true;
  };
  public canReadEntityModels:() => boolean = () => {
    return false;
  };
  public canWriteEntityModels:() => boolean = () => {
    return false;
  };
  public canReadFlows:() => boolean = () => {
    return true;
  };
  public canWriteFlows:() => boolean = () => {
    return true;
  };
  public canReadStepDefinitions:() => boolean = () => {
    return false;
  };
  public canWriteStepDefinitions:() => boolean = () => {
    return false;
  };
  public hasOperatorRole:() => boolean = () => {
    return true;
  };
}

const response = {"data":{"jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a"}, "status": 200};
const jobResp = {
  "data": {
    "jobId": "350da405-c1e9-4fa7-8269-d9aefe3b4b9a",
    "flow": "testFlow",
    "user": "admin",
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

const data = {
    flows: flows,
    response: response,
    loads: loads,
    jobResp: jobResp,
    mockRoleService: new MockRolesService()
};

export default data;
