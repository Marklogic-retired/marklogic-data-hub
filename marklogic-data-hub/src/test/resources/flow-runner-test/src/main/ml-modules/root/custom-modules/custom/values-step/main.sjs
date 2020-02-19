const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(values, options) {

  let content = fn.head(cts.search(cts.collectionQuery('test-values-collection'))).toObject();

  content.uri = "/prefix/" + content.uri;

  return content;
}

module.exports = {
  main: main
};
