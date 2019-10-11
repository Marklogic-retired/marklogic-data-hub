const merging = require('/com.marklogic.smart-mastering/merging.xqy');
const masteringStepLib = require('/data-hub/5/builtins/steps/mastering/default/lib.sjs');
const collImpl = require('/com.marklogic.smart-mastering/survivorship/merging/collections.xqy');
const requiredOptionProperties = ['mergeOptions'];

function main(content, options) {
  masteringStepLib.checkOptions(content, options, null, requiredOptionProperties);
  let uris = [];
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  for (const item of content) {
    uris.push(item.uri);
    item.context.collections = collImpl.onArchive({ [item.uri]: Sequence.from(item.context.originalCollections) }, mergeOptions.xpath('options/algorithms/collections/onArchive'));
  }
  let mergedDocument = fn.head(merging.buildMergeModelsByUri(uris, mergeOptions));
  let contentArray = content.toArray();
  contentArray.push(mergedDocument['audit-trace']);
  let filteredContent = contentArray.filter((item) => item.uri !== mergedDocument.uri);
  return Sequence.from(filteredContent.concat([mergedDocument]));
}

module.exports = {
  main: main
};
