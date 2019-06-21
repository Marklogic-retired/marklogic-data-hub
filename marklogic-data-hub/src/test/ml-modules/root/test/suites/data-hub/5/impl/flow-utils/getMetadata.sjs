const test = require("/test/test-helper.xqy");

const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const flowUtils = new FlowUtils();

const results = [];
const metadata = [];

let jobId = "alpha-num3r1c-j06-1d";
let flowDoc = {
                "name": "testFlow",
                "description": "This is the flow doc to test metadata values",
                "steps": {
                  "1": {
                    "name": "ingestion",
                    "description": "This is the custom ingestion step",
                    "stepDefinitionName": "ingestion",
                    "stepDefinitionType": "INGESTION"
                  },
                  "2": {
                    "name": "mapping",
                    "description": "This is the custom mapping step",
                    "stepDefinitionName": "mapping",
                    "stepDefinitionType": "MAPPING"
                  },
                  "3": {
                     "name": "mastering",
                     "description": "This is the custom mapping step",
                     "stepDefinitionName": "mastering",
                     "stepDefinitionType": "MASTERING"
                  }
                }
              };

//metadata is set in processResults method of flow.sjs as below and it gets called for every step in the flowDoc
//this is to verify that stepDefName corresponding to the stepNumber is the value of metadata datahubCreatedByStep
for (const stepNum in flowDoc.steps) {
  metadata.push(flowUtils.createMetadata(metadata ? metadata : {}, flowDoc.name, flowDoc.steps[stepNum].stepDefinitionName, jobId).datahubCreatedByStep)
}


results.push(
  test.assertEqual("ingestion,mapping,mastering", metadata.toString())
);

results;
