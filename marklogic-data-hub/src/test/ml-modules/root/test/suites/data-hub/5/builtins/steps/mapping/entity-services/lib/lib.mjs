import esMapping from "/data-hub/5/builtins/steps/mapping/entity-services/main.mjs";
function invokeTestMapping(docURI, mappingName, mappingVersion ) {
  let doc = cts.doc(docURI);
  let result = esMapping.main({uri: docURI, value: doc}, {
    mapping: {name: mappingName, version: mappingVersion},
    outputFormat: 'json'
  }).value.root;

  return result.envelope.instance;

}

export default {
  invokeTestMapping
}
