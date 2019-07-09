const test = require("/test/test-helper.xqy");

const Jobs = require("/data-hub/5/impl/jobs.sjs");
const jobs = new Jobs();

function getJobDocs(flowNameArray) {
  return fn.head(
    xdmp.invokeFunction(
      function () {
        return jobs.getJobDocsForFlows(flowNameArray);
      },
      {database: xdmp.database("data-hub-JOBS")})
  );
}

function getJobDocsForTwoFlows() {
  const docs = getJobDocs(["ingestion_mapping-flow", "ingestion_mapping_mastering-flow"]);
  const mappingJobs = docs["ingestion_mapping-flow"];
  const masteringJobs = docs["ingestion_mapping_mastering-flow"];

  return [
    test.assertEqual(1, mappingJobs.jobIds.length),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", mappingJobs.jobIds[0]),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", mappingJobs.latestJob.job.jobId),

    test.assertEqual(2, masteringJobs.jobIds.length),
    test.assertEqual("3818b8a5-a205-48b1-9b20-8edf21b43cf0", masteringJobs.jobIds[0]),
    test.assertEqual("864ab47f-225c-493d-8e35-ab76ee1d02e6", masteringJobs.jobIds[1]),
    test.assertEqual("864ab47f-225c-493d-8e35-ab76ee1d02e6", masteringJobs.latestJob.job.jobId,
      "This job has a later timestamp and should thus be returned as the latest job")
  ];
}

function getJobDocsForOneFlow() {
  const mappingJobs = getJobDocs("ingestion_mapping-flow")["ingestion_mapping-flow"];
  return [
    test.assertEqual(1, mappingJobs.jobIds.length),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", mappingJobs.jobIds[0]),
    test.assertEqual("293c638e-21e9-45b6-98cc-223d834f9222", mappingJobs.latestJob.job.jobId)
  ];
}

function getJobDocsForZeroFlows() {
  const docs = getJobDocs([]);
  return [
    test.assertEqual(0, Object.keys(docs).length,
      "When no flow names are passed in, an empty object should be returned")
  ];
}

[]
  .concat(getJobDocsForTwoFlows())
  .concat(getJobDocsForOneFlow())
  .concat(getJobDocsForZeroFlows());
