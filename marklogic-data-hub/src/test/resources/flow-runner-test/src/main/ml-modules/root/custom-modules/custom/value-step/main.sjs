const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(values, options) {

  let content =  {};
  //manually get doc based on values
  content.value = fn.head(cts.search(cts.collectionQuery(values)).toObject();
  content.context = {};
  content.context.collections = ['test-values-collection'];
  content.uri = "/prefix" + content.uri;
  //pass document back to be written with a /prefix in front of it to now give us 2 docs in the test-values-collection in this test
  return Sequence.from(content);
}

module.exports = {
  main: main
};
