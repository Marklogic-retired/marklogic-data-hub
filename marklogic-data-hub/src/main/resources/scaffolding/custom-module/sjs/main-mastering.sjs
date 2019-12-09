/* Custom steps for data hub 5 are 'on rails' code execution within a single transaction, after which the output
   from these steps will create in-memory objects that will then be written in one single, isolated transaction.

   However, with mastering, we typically accept an entire batch at once
 */

const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");

function main(content, options) {
  const filteredContent = [];

  //here we lock the documents that have not already been placed in the archived collection
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
