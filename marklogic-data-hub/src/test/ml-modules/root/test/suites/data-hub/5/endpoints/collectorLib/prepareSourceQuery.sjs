const test = require("/test/test-helper.xqy");
const CollectorLib = require("/data-hub/5/endpoints/collectorLib.sjs");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const lib = new CollectorLib(datahub);
let assertions = [];

// Query is for a default-merging step
let sourceQuery = lib.prepareSourceQuery(
  {
    sourceQuery: "cts.collectionQuery('test')"
  },
  {
    name: "default-merging",
    type: "merging"
  }
);

// Query constrained to job
sourceQuery = lib.prepareSourceQuery(
  {
    sourceQuery: "cts.collectionQuery('test')",
    constrainSourceQueryToJob: true,
    jobId: "job123"
  }, {}
);
assertions.push(
  test.assertEqual(
    "cts.uris(null, null, cts.andQuery([cts.fieldWordQuery('datahubCreatedByJob', 'job123'), cts.collectionQuery('test')]))",
    sourceQuery,
    "When constrainSourceQueryToJob is set to true, and a jobId is set, then the sourceQuery is and'ed with a " +
    "query on datahubCreatedByJob (the contents of the step definition don't matter)"
  )
);

// Query constrained to job, user source query with double quotes in it
let options = {
  constrainSourceQueryToJob: true,
  jobId: "job123"
};
options.sourceQuery = 'cts.collectionQuery("test")';
sourceQuery = lib.prepareSourceQuery(options, {});
assertions.push(
  test.assertEqual(
    "cts.uris(null, null, cts.andQuery([cts.fieldWordQuery('datahubCreatedByJob', 'job123'), cts.collectionQuery(\"test\")]))",
    sourceQuery,
    "Just verifying that if the user's query has double quotes on it, things still work"
  )
);

// Query constrained to job, but no job ID
sourceQuery = lib.prepareSourceQuery(
  {
    sourceQuery: "cts.collectionQuery('test')",
    constrainSourceQueryToJob: true
  }, {}
);
assertions.push(
  test.assertEqual(
    "cts.uris(null, null, cts.collectionQuery('test'))",
    sourceQuery,
    "If no jobId is provided in the options, then the query won't be constrained by a job"
  )
);

sourceQuery = lib.prepareSourceQuery(
  {
    sourceQuery: "cts.uris(null, null, cts.trueQuery())"
  }, {}
);
assertions.push(
  test.assertEqual("cts.uris(null, null, cts.trueQuery())", sourceQuery,
    "For backwards compatibility (even though it's not documented or tested anywhere), a user can pass in cts.uris " +
    "without having to set sourceQueryIsScript")
);

assertions;
