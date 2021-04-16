const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const runtimeOptions = {
  "stepOptions": {
    "1": {
      "provenanceGranularityLevel": "off"
    },
    "2": {
      "provenanceGranularityLevel": "coarse"
    }
  }
};

const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" } },
  { "uri": "/customer2.json", "value": { "customerId": "2" } }
];

const response = flowRunner.processContentWithFlow(flowName, contentArray, jobId, runtimeOptions);

const assertions = [
  test.assertEqual("finished", response.jobStatus),
  test.assertEqual(2, hubTest.getProvenanceCount(), 
    "Expecting 2 prov docs for the mapping step, and zero for the ingestion step since prov was disabled"
  )
];

const provIds = xdmp.invokeFunction(function() {
  return sem.sparql(
    "SELECT ?s WHERE {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://marklogic.com/dhf#MappingStep>}");
  }, 
  {database:xdmp.database("data-hub-JOBS")}
).toArray()

assertions.push(
  test.assertEqual(2, provIds.length, "Verifying that both of the prov IDs are associated with a mapping step")
);

assertions