function ingest(workUnit, endpointState, input) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/ingestion/bulkIngester.sjs",
    {workUnit, endpointState, input}
  ));
}

module.exports = {
  ingest
};
