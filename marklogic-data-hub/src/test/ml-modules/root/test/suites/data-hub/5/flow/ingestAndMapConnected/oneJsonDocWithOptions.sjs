const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

/**
 * This test verifies that runtime options are honored. It also verifies the details of the two documents that are
 * persisted, while the twoJsonDocs test is focused more on the response object.
 */
const flowName = "ingestAndMap";
const jobId = sem.uuidString();
const options = {
  "permissions": "data-hub-operator,read,data-hub-operator,update"
};
const contentArray = [
  { "uri": "/customer1.json", "value": { "customerId": "1" }}
];

const response = flowRunner.processContentWithFlow(flowName, contentArray, jobId, options);

const finalCustomer = hubTest.getRecord("/customer1.json");
const assertions = [
  test.assertEqual("finished", response.jobStatus),
  test.assertEqual(1, finalCustomer.document.envelope.instance.Customer.customerId,
    "Verifies that the entity was mapped correctly"),
  test.assertEqual("Customer", finalCustomer.document.envelope.instance.info.title),
  test.assertEqual("0.0.1", finalCustomer.document.envelope.instance.info.version),
  test.assertEqual("http://example.org/", finalCustomer.document.envelope.instance.info.baseUri),
  test.assertEqual(3, finalCustomer.collections.length),
  test.assertEqual("Customer", finalCustomer.collections[0]),
  test.assertEqual("ingestCustomer", finalCustomer.collections[1], 
    "By default, collections should be retained from previous steps, though any step in the flow " + 
    "is free to modify the set of collections"),
  test.assertEqual("mapCustomer", finalCustomer.collections[2]),
  test.assertEqual("read", finalCustomer.permissions["data-hub-operator"][0],
    "Verifies that the runtime options overrode the step options for permissions"),
  test.assertEqual("update", finalCustomer.permissions["data-hub-operator"][1]),
  test.assertEqual(xdmp.getCurrentUser(), finalCustomer.metadata.datahubCreatedBy),
  test.assertEqual("mapCustomer", finalCustomer.metadata.datahubCreatedByStep),
  test.assertEqual("ingestAndMap", finalCustomer.metadata.datahubCreatedInFlow),
  test.assertNotEqual(null, finalCustomer.metadata.datahubCreatedOn),
  test.assertEqual(response.jobId, finalCustomer.metadata.datahubCreatedByJob)
];

const stagingCustomer = hubTest.getStagingRecord("/customer1.json");
assertions.concat(
  test.assertEqual("1", stagingCustomer.document.envelope.instance.customerId),
  test.assertEqual(1, stagingCustomer.collections.length),
  test.assertEqual("ingestCustomer", stagingCustomer.collections[0]),
  test.assertEqual("read", stagingCustomer.permissions["data-hub-operator"][0],
    "Verifies that permissions was overridden by the runtime options"),
  test.assertEqual("update", stagingCustomer.permissions["data-hub-operator"][1]),
  test.assertEqual(xdmp.getCurrentUser(), stagingCustomer.metadata.datahubCreatedBy),
  test.assertEqual("ingestCustomer", stagingCustomer.metadata.datahubCreatedByStep),
  test.assertEqual("ingestAndMap", stagingCustomer.metadata.datahubCreatedInFlow),
  test.assertNotEqual(null, stagingCustomer.metadata.datahubCreatedOn),
  test.assertEqual(response.jobId, stagingCustomer.metadata.datahubCreatedByJob)
);
