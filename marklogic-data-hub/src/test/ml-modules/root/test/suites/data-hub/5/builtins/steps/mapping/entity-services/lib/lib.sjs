const esMapping = require("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs");
function invokeTestMapping(docURI, mappingName, mappingVersion ) {
  let doc = cts.doc(docURI);
  let result = esMapping.main({uri: docURI, value: doc}, {
    mapping: {name: mappingName, version: mappingVersion},
    outputFormat: 'json'
  }).value.root;

  return result.envelope.instance;

}

module.exports = {
  invokeTestMapping
}
