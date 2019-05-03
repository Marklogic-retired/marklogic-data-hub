const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");

function main(content, options) {
  const filteredContent = [];
  for (const item of content) {
    if (!xdmp.nodeCollections(item.value).includes(masteringConsts['ARCHIVED-COLL'])) {
      xdmp.lockForUpdate(item.uri);
      filteredContent.push(item);
    }
  }
  // Data Hub will persist the results for us.
  let persistResults = false;
  options.mergeOptions.targetEntity = options.targetEntity;
  options.matchOptions.targetEntity = options.targetEntity;
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  return mastering.processMatchAndMergeWithOptions(Sequence.from(filteredContent), mergeOptions, matchOptions, cts.trueQuery(), persistResults);
}

module.exports = {
  main: main
};
