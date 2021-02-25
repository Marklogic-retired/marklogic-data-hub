const test = require("/test/test-helper.xqy");

const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

const assertions = [];

const initialMetadata = flowUtils.createMetadata({}, "myFlow", "stepOne", "job-one");
const currentDate = fn.substring(fn.currentDate().toString(), 1, 10);
assertions.push(
  test.assertEqual("myFlow", initialMetadata.datahubCreatedInFlow),
  test.assertEqual("stepOne", initialMetadata.datahubCreatedByStep),
  test.assertEqual("job-one", initialMetadata.datahubCreatedByJob),
  test.assertEqual(currentDate, fn.substring(initialMetadata.datahubCreatedOn, 1, 10),
    "datahubCreatedOn is expected to be populated with the current dateTime")
);

const updatedMetadata = flowUtils.createMetadata(initialMetadata, "mySecondFlow", "stepTwo", "job-two");
assertions.push(
  test.assertEqual("mySecondFlow", initialMetadata.datahubCreatedInFlow),
  test.assertEqual("stepTwo", initialMetadata.datahubCreatedByStep),
  test.assertEqual("job-one job-two", initialMetadata.datahubCreatedByJob,
    "Per DHFPROD-2285, multiple job IDs are retained, delimited by spaces. It is not known why this is done for job ID " +
    "but not for the other metadata keys")
);

assertions;
