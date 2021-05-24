const test = require("/test/test-helper.xqy");
const jobs = require("/data-hub/5/impl/jobs.sjs");

function getJob(jobId) {
    return fn.head(
        xdmp.invokeFunction(
            function () {
                return jobs.getJobWithDetails(jobId);
            },
            {database: xdmp.database("data-hub-JOBS")})
    );
}

let assertions = [];
// ingestion_mapping-flow job
let result = getJob("293c638e-21e9-45b6-98cc-223d834f9222").job;
assertions = assertions.concat([
    test.assertEqual(xs.dateTime(result.timeEnded).subtract(xs.dateTime(result.timeStarted)), result.duration, `Duration should be added and have the correct value.`),
    test.assertEqual(true, result.flowOrStepsUpdatedSinceRun, `Flow ingestion_mapping-flow doesn't exist so it has been deleted since the run so we expect an updated to be detected.`)
]);

// ingestion_mapping_mastering-flow job 1
result = getJob("3818b8a5-a205-48b1-9b20-8edf21b43cf0").job;
assertions = assertions.concat([
    test.assertEqual(xs.dateTime(result.timeEnded).subtract(xs.dateTime(result.timeStarted)), result.duration, `Duration should be added and have the correct value.`),
    test.assertEqual(true, result.flowOrStepsUpdatedSinceRun, `Flow ingestion_mapping_mastering-flow has a lastUpdated value greater than timeStarted so we expect an updated to be detected.`)
]);

// ingestion_mapping_mastering-flow job 2
result = getJob("864ab47f-225c-493d-8e35-ab76ee1d02e6").job;
assertions = assertions.concat([
    test.assertEqual(xs.dateTime(result.timeEnded).subtract(xs.dateTime(result.timeStarted)), result.duration, `Duration should be added and have the correct value.`),
    test.assertEqual(false, result.flowOrStepsUpdatedSinceRun, `Flow ingestion_mapping_mastering-flow has a lastUpdated value less than timeStarted so we expect an updated to not be detected.`)
]);

assertions;