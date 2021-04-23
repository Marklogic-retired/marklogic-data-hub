const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const flowName = "myFlow";

const response = flowRunner.processContentWithFlow(flowName,
  [{
    "uri": "/incomingCustomer.json",
    "value": {
      "envelope": {
        "headers": {
          "headerFromIncomingCustomer": true
        },
        "triples": [
          {
            "triple": {
              "subject": "newCustomer",
              "predicate": "willThis",
              "object": "showUp"
            }
          },
          {
            "triple": {
              "subject": "duplicateSubject",
              "predicate": "dupe",
              "object": "dupe"
            }
          }
        ],
        "instance": {
          "customerId": 1,
          "name": "New Jane",
          "status": "new status"    
        }
      }
    }
  }],
  sem.uuidString(), {}
);

const assertions = [
  test.assertEqual("finished", response.jobStatus)
];

// This is based on the URIs that were merged together
const expectedMergedDocUri = "/com.marklogic.smart-mastering/merged/1e3ec6e5e6214b641a386f0fe6b2e1cf.json";

// Verify the merged doc first
const mergedRecord = hubTest.getRecord(expectedMergedDocUri);
const mergedDoc = mergedRecord.document.envelope;
assertions.push(
  // Verify headers
  test.assertEqual(true, mergedDoc.headers.headerFromMappingStep, 
    "The header added by the mapping step should have been merged"),
  test.assertEqual(true, mergedDoc.headers.headerFromIncomingCustomer, 
    "The header that already existed on the incoming customer should have been merged"),
  test.assertEqual(true, mergedDoc.headers.headerFromMatchingCustomer,
    "The header from the matching customer should have been merged"),
  test.assertEqual(expectedMergedDocUri, mergedDoc.headers.id, 
    "Merging is expected to store the merged document URI in the 'id' header"),
  test.assertEqual(2, mergedDoc.headers.merges.length, 
    "The merges array should have one entry for each of the 2 merged documents"),
  test.assertEqual("/content/matchingCustomer.json", mergedDoc.headers.merges[0]["document-uri"]),
  test.assertEqual("/incomingCustomer.json", mergedDoc.headers.merges[1]["document-uri"]),

  // Verify triples
  test.assertEqual(3, mergedDoc.triples.length, 
    "The matching customer has 2 triples, and the incoming customer has 2 triples; " + 
    "one of those 2 triples is a duplicate, so there should be 3 total"),
  test.assertEqual("duplicateSubject", mergedDoc.triples[0].triple.subject),
  test.assertEqual("dupe", mergedDoc.triples[0].triple.predicate),
  test.assertEqual("dupe", mergedDoc.triples[0].triple.object),
  test.assertEqual("matchingCustomer", mergedDoc.triples[1].triple.subject),
  test.assertEqual("myPredicate", mergedDoc.triples[1].triple.predicate),
  test.assertEqual("myObject", mergedDoc.triples[1].triple.object),
  test.assertEqual("newCustomer", mergedDoc.triples[2].triple.subject),
  test.assertEqual("willThis", mergedDoc.triples[2].triple.predicate),
  test.assertEqual("showUp", mergedDoc.triples[2].triple.object),

  // Verify instance
  test.assertEqual("Customer", mergedDoc.instance.info.title),
  test.assertEqual("0.0.1", mergedDoc.instance.info.version),
  test.assertEqual("http://example.org/", mergedDoc.instance.info.baseUri),
  test.assertEqual("1", mergedDoc.instance.Customer.customerId,
    "TODO This seems like a bug - customerId became a string, but it's a number on both source documents"),
  test.assertEqual("Existing nickname", mergedDoc.instance.Customer.nicknames[0],
    "The nickname from the matching customer should have been merged"),
  test.assertEqual("new status", mergedDoc.instance.Customer.status, 
    "The status value from the incoming customer should have been merged"),
  test.assertEqual(2, mergedDoc.instance.Customer.name.length, 
    "Even though name is a single-value property, merging defaults to concatenating values"),
  test.assertEqual("Existing Jane", mergedDoc.instance.Customer.name[0]),
  test.assertEqual("New Jane", mergedDoc.instance.Customer.name[1]),

  // Verify collections
  test.assertTrue(mergedRecord.collections.includes("merged-customer")),
  test.assertTrue(mergedRecord.collections.includes("sm-Customer-merged")),
  test.assertTrue(mergedRecord.collections.includes("sm-Customer-mastered")),
  test.assertTrue(mergedRecord.collections.includes("http://example.org/Customer-0.0.1/Customer")),
  test.assertTrue(mergedRecord.collections.includes("raw-content")),
  test.assertTrue(mergedRecord.collections.includes("Customer"), 
    "Customer should be from the incoming record (the mapping step added it to that record)")
);

// Verify the matching customer was archived
const matchingCustomer = hubTest.getRecord("/content/matchingCustomer.json");
assertions.push(
  test.assertTrue(matchingCustomer.collections.includes("merged-customer")),
  test.assertTrue(matchingCustomer.collections.includes("raw-content")),
  test.assertTrue(matchingCustomer.collections.includes("sm-Customer-archived"))
);

// Verify the incoming customer was persisted and archived. While the user may not want this
// document to be persisted by the merging step, it seems unavoidable since the merging step wants 
// to make some update to collections on every document that it processes.
const incomingCustomer = hubTest.getRecord("/incomingCustomer.json");
assertions.push(
  test.assertTrue(incomingCustomer.collections.includes("Customer"), 
    "Customer should have been added by the mapping step"),
  test.assertTrue(incomingCustomer.collections.includes("merged-customer"), 
    "merged-customer should have been added by the merging step"),
  test.assertTrue(incomingCustomer.collections.includes("sm-Customer-archived"))
);

// Verify the audit record
const auditRecord = hubTest.getRecordInCollection("sm-Customer-auditing");
assertions.push(
  test.assertTrue(auditRecord.uri.startsWith("/com.marklogic.smart-mastering/auditing/merge"), 
    "Expected a single audit document to have been created that captures prov details of the merge")
);

// Verify jobReport
const report = hubTest.getRecordInCollection("JobReport", "data-hub-JOBS").document;
assertions.push(
  test.assertEqual(response.jobId, report.jobID),
  test.assertTrue(report.jobReportID != null),
  test.assertEqual(flowName, report.flowName),
  test.assertEqual("step3", report.stepName),
  test.assertEqual(1, report.numberOfDocumentsProcessed),
  test.assertEqual(1, report.numberOfDocumentsSuccessfullyProcessed),
  test.assertEqual(1, report.resultingMerges.count, 
    "Expecting the 1 merge to have been captured"),
  test.assertEqual(2, report.documentsArchived.count,
    "Both the incoming and existing customer documents should have been archived"),
  test.assertEqual(1, report.masterDocuments.count,
    "The merged document is captured as having been mastered as well"),
  test.assertEqual(0, report.notificationDocuments.count,
    "No notifications were generated by the test"),
  test.assertEqual("sm-Customer-archived", report.collectionsInformation.archivedCollection),
  test.assertEqual("sm-Customer-mastered", report.collectionsInformation.contentCollection),
  test.assertEqual("sm-Customer-merged", report.collectionsInformation.mergedCollection),
  test.assertEqual("sm-Customer-notification", report.collectionsInformation.notificationCollection),
  test.assertEqual("sm-Customer-auditing", report.collectionsInformation.auditingCollection),
  test.assertTrue(report.matchProvenanceQuery != null)
);

assertions;
