const test = require("/test/test-helper.xqy");

function invokeService(entityCollection) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/jobInfo/jobInfo.sjs",
    {"model": entityCollection}
  ));
}

function multipleMatchingEntities() {
  const result = invokeService("jobInfoTestEntity");
  return [
    test.assertEqual("jobInfoTestEntity", result.modelName),
    test.assertEqual("2019-09-20T00:00:00", result.jobTime),
    test.assertEqual("job3", result.jobId,
      "When an entity has been processed by many jobs, the datahubCreatedByJob property ends up containing " +
      "multiple space-delimited values. The last value in that list is the latest job ID, and thus it should be " +
      "returned.")
  ];
}

function noMatchingEntities() {
  const result = invokeService("someCollectionWithNothingInIt");
  return [
    test.assertEqual("someCollectionWithNothingInIt", result.modelName),
    test.assertEqual(null, result.jobTime),
    test.assertEqual(null, result.jobId)
  ];
}

[]
  .concat(multipleMatchingEntities())
  .concat(noMatchingEntities());
