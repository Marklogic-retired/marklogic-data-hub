function ingest(workUnit, endpointState, input) {
  return fn.head(xdmp.invoke(
    "/marklogic-data-hub-spark-connector/bulkIngester.sjs",
    {workUnit, endpointState, input}
  ));
}

module.exports = {
  ingest
};
