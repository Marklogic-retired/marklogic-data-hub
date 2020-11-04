function ingest(endpointConstants, endpointState, input) {
  return fn.head(xdmp.invoke(
    "/marklogic-data-hub-spark-connector/writeRecords.sjs",
    {endpointConstants, endpointState, input}
  ));
}

module.exports = {
  ingest
};
