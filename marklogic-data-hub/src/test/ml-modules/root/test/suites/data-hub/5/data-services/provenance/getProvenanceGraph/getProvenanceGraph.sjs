const test = require("/test/test-helper.xqy");
const provService = require("/test/suites/data-hub/5/data-services/lib/provenanceService.sjs");
const assertions = [];

const documentProvenanceGraph = provService.getProvenanceGraph("testJSONObjectInstanceMerged.json");
assertions.push(
  test.assertEqual(5, documentProvenanceGraph.activities.length, `Expected 5 (2 ingest + 2 map + 1 merge) activities in response: ${xdmp.toJsonString(documentProvenanceGraph.activities)}`),
  // merging
  test.assertEqual(4, documentProvenanceGraph.activities[0].nodes.length, `Expected 4 nodes in activity[0] (1 generatedBy + 2 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[0])}`),
  test.assertEqual(3, documentProvenanceGraph.activities[0].links.length, `Expected 3 links in activity[0] (2 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[0])}`),
  // mapping doc 2
  test.assertEqual(3, documentProvenanceGraph.activities[1].nodes.length, `Expected 3 nodes in activity[1] (1 generatedBy + 1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[1])}`),
  test.assertEqual(2, documentProvenanceGraph.activities[1].links.length, `Expected 2 links in activity[1] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[1])}`),
  // mapping doc 1
  test.assertEqual(3, documentProvenanceGraph.activities[2].nodes.length, `Expected 3 nodes in activity[2] (1 generatedBy + 1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[2])}`),
  test.assertEqual(2, documentProvenanceGraph.activities[2].links.length, `Expected 2 links in activity[2] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[2])}`),
  // ingestion doc 2
  test.assertEqual(3, documentProvenanceGraph.activities[3].nodes.length, `Expected 3 nodes in activity[3] (1 generatedBy + 1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[3])}`),
  test.assertEqual(2, documentProvenanceGraph.activities[3].links.length, `Expected 3 links in activity[3] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[3])}`),
  test.assertEqual("External Table", documentProvenanceGraph.activities[3].nodes[2].label, `Expected 3 links in activity[3] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[3].nodes[2])}`),
  // ingestion doc 1
  test.assertEqual(3, documentProvenanceGraph.activities[4].nodes.length, `Expected 3 nodes in activity[4] (1 generatedBy + 1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[4])}`),
  test.assertEqual(2, documentProvenanceGraph.activities[4].links.length, `Expected 2 links in activity[4] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[4])}`),
  test.assertEqual("External Table", documentProvenanceGraph.activities[4].nodes[2].label, `Expected 3 links in activity[3] (1 derivedFrom + 1 activity) activity: ${xdmp.toJsonString(documentProvenanceGraph.activities[4].nodes[2])}`)
);

assertions;