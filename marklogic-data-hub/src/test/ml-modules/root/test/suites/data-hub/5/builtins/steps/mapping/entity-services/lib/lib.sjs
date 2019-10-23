function invokeTestMapping(docURI, mappingName, mappingVersion ) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mapping/testMapping.sjs",
    {"docURI": docURI, "mappingName":mappingName, "mappingVersion":mappingVersion}
  ));
}

module.exports = {
  invokeTestMapping
}
