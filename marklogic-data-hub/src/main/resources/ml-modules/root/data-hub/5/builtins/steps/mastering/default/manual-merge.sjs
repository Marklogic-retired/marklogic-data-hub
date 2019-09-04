const merging = require('/com.marklogic.smart-mastering/merging.xqy');
const masteringMain = require('/data-hub/5/builtins/steps/mastering/default/main.sjs');
const collImpl = require('/com.marklogic.smart-mastering/survivorship/merging/collections.xqy');

function main(content, options) {
  masteringMain.checkOptions(content, options);
  let uris = [];
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  for (const item of content) {
    uris.push(item.uri);
    item.context.collections = collImpl.onArchive({ [item.uri]: item.context.originalCollections }, mergeOptions.xpath('options/algorithms/collections/onArchive'));
  }
  let mergedDocument = fn.head(merging.buildMergeModelsByUri(uris, mergeOptions));
  let contentArray = content.toArray();
  mergedDocument.context = mergedDocument.context || {
    permissions: Sequence.from(contentArray.map((item) => item.context.permissions))
  };
  mergedDocument.context.collections = collImpl.onMerge(contentArray.reduce((prev, item) => {
    prev[item.uri] = Sequence.from(item.context.originalCollections);
    return prev;
  },{}), mergeOptions.xpath('options/algorithms/collections/onMerge'));
  let filteredContent = contentArray.filter((item) => item.uri !== mergedDocument.uri);
  return Sequence.from(filteredContent.concat([mergedDocument]));
}

module.exports = {
  main: main
};
