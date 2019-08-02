/* Custom steps for data hub 5 are 'on rails' code execution within a single transaction, after which the output
   from these steps will create in-memory objects that will then be written in one single, isolated transaction.

   This is designed to run in QUERY (read-only) mode by default. If you need transactionally consistent updates or
   serializable read locking on documents, then you must upgrade to an UPDATE transaction either through an update
   (such as declareUpdate()) or by setting the value of 'stepUpdate' as true in the options and it will be
   executed in update mode.
 */

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
