const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");

function main(content, options) {
  // Data Hub will persist the results for us.
  let persistResults = false;
  options.mergeOptions.targetEntity = options.targetEntity;
  options.matchOptions.targetEntity = options.targetEntity;
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  return mastering.processMatchAndMergeWithOptions(content, mergeOptions, matchOptions, cts.trueQuery(), persistResults);
}

module.exports = {
  main: main
};
