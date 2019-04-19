const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");

function main(content, options) {
  // Data Hub will persist the results for us.
  let persistResults = false;
  if (!options.matchOptions.collections) {
    let mdmCollections = ['mdm-content'];
    let contentCollections = xdmp.nodeCollections(fn.head(content).value);
    if (options.sourceCollection) {
      mdmCollections = Array.isArray(options.sourceCollection) ? options.sourceCollection : [options.sourceCollection];
    } else if (options.sourceQuery) {
      mdmCollections = contentCollections.filter((col) => options.sourceQuery.includes(col));
    }
    options.matchOptions.collections = { "content": mdmCollections };
    xdmp.log(xdmp.describe(options.matchOptions.collections,Sequence.from([]),Sequence.from([])));
  }
  options.mergeOptions.targetEntity = options.targetEntity;
  options.matchOptions.targetEntity = options.targetEntity;
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  return mastering.processMatchAndMergeWithOptions(content, mergeOptions, matchOptions, cts.notQuery(cts.collectionQuery('mdm-archived')), persistResults);
}

module.exports = {
  main: main
};
