const Batch = require("/data-hub/5/flow/batch.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const dhmut = require("/data-hub/public/marklogic-unit-test/hub-test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");
const jobs = require("/data-hub/5/impl/jobs.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");
const test = require("/test/test-helper.xqy");

const fakeFlow = {"name": "myFlow", "steps": {"1": {}}};

// Insert some job documents so we can verify that they're deleted
const fakeJob = jobs.createJob(fakeFlow.name);

const stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {}, fakeJob.job.jobId, {});
const batch = new Batch(fakeJob.job.jobId, fakeFlow.name);
batch.addSingleStepResult(stepExecutionContext, [], {});
batch.persist();

const assertions = [];

assertions.push(
  test.assertEqual(1, hubTest.getStagingCollectionSize("raw-content"), "The user content should exist"),
  test.assertEqual(1, hubTest.getFinalCollectionSize("raw-content"), "The user content should exist"),
  test.assertEqual(1, hubTest.getJobCollectionSize("Job")),
  test.assertEqual(1, hubTest.getJobCollectionSize("Batch")),

  test.assertEqual(15, hubTest.getStagingCollectionSize(consts.HUB_ARTIFACT_COLLECTION),
    "Assuming 15 OOTB DHF artifacts; adjust this test as that number increases"),
  test.assertEqual(1, hubTest.getStagingCollectionSize(consts.ENTITY_MODEL_COLLECTION)),
  test.assertEqual(7, hubTest.getStagingCollectionSize(consts.FLOW_COLLECTION),
    "Expecting the 6 OOTB DHF flows and 1 user one"),
  test.assertEqual(10, hubTest.getStagingCollectionSize(consts.STEP_DEFINITION_COLLECTION),
    "Expecting the 9 OOTB DHF step definitions and 1 user one"),
  test.assertEqual(1, hubTest.getStagingCollectionSize(consts.STEP_COLLECTION), "Expecting 1 user step"),

  test.assertEqual(15, hubTest.getFinalCollectionSize(consts.HUB_ARTIFACT_COLLECTION)),
  test.assertEqual(1, hubTest.getFinalCollectionSize(consts.ENTITY_MODEL_COLLECTION)),
  test.assertEqual(7, hubTest.getFinalCollectionSize(consts.FLOW_COLLECTION)),
  test.assertEqual(10, hubTest.getFinalCollectionSize(consts.STEP_DEFINITION_COLLECTION)),
  test.assertEqual(1, hubTest.getFinalCollectionSize(consts.STEP_COLLECTION))
);

// A user will normally put this in her suiteSetup or setup module; we need to call it here because the setup
// for this test involves first loading some user artifacts so we can verify they're not deleted.
// Note also that if a user were to use setup.sjs, they'll need to include declareUpdate. If they use
// setup.xqy, they of course do not need to.
xdmp.invokeFunction(function(){declareUpdate();dhmut.prepareDatabases();});

assertions.push(
  // Data that should have been deleted
  test.assertEqual(0, hubTest.getStagingCollectionSize("raw-content"), "The user content should have been deleted"),
  test.assertEqual(0, hubTest.getFinalCollectionSize("raw-content"), "The user content should have been deleted"),
  test.assertEqual(0, hubTest.getJobCollectionSize("Job"), "Job doc should have been deleted"),
  test.assertEqual(0, hubTest.getJobCollectionSize("Batch"), "Batch doc should have been deleted"),

  // Data that should still exist
  test.assertEqual(15, hubTest.getStagingCollectionSize(consts.HUB_ARTIFACT_COLLECTION),
    "Should still have all OOTB DHF artifacts"),
  test.assertEqual(1, hubTest.getStagingCollectionSize(consts.ENTITY_MODEL_COLLECTION), "User artifacts should still exist"),
  test.assertEqual(7, hubTest.getStagingCollectionSize(consts.FLOW_COLLECTION), "All flow should still exist"),
  test.assertEqual(10, hubTest.getStagingCollectionSize(consts.STEP_DEFINITION_COLLECTION), "All step definitions should still exist"),
  test.assertEqual(1, hubTest.getStagingCollectionSize(consts.STEP_COLLECTION), "The step should still exist"),

  test.assertEqual(15, hubTest.getFinalCollectionSize(consts.HUB_ARTIFACT_COLLECTION)),
  test.assertEqual(1, hubTest.getFinalCollectionSize(consts.ENTITY_MODEL_COLLECTION)),
  test.assertEqual(7, hubTest.getFinalCollectionSize(consts.FLOW_COLLECTION)),
  test.assertEqual(10, hubTest.getFinalCollectionSize(consts.STEP_DEFINITION_COLLECTION)),
  test.assertEqual(1, hubTest.getFinalCollectionSize(consts.STEP_COLLECTION))
);

assertions
