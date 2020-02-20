const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

function main(values, options) {

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //manually get doc based on values
  let findDoc = fn.head(cts.search(cts.collectionQuery(values.valueOf())));
  let content = {};
  let uri = fn.documentUri(findDoc);
  let instance = findDoc.toObject().envelope.instance;
  let triples = [];
  let headers = {};
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);
  content.value = envelope;
  content.context = {};
  content.context.collections = ['test-values-collection'];
  content.context.permissions = "data-hub-operator,read,data-hub-operator,update";
  content.uri = "/prefix" + uri;
  //pass document back to be written with a /prefix in front of it to now give us 2 docs in the test-values-collection in this test
  return content;
}

module.exports = {
  main: main
};
