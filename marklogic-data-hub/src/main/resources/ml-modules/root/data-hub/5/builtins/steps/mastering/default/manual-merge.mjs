import merging from '/com.marklogic.smart-mastering/merging.xqy';
import masteringStepLib from '/data-hub/5/builtins/steps/mastering/default/lib.mjs';
import collImpl from '/com.marklogic.smart-mastering/survivorship/merging/collections.xqy';
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
const quickStartRequiredOptionProperty = 'mergeOptions';
const hubCentralRequiredOptionProperty = 'mergeRules';

function main(content, options) {
  masteringStepLib.checkOptions(null, options, null, [[quickStartRequiredOptionProperty,hubCentralRequiredOptionProperty]]);
  let uris = [];
  let mergeOptions = new NodeBuilder().addNode(options).toNode();
  for (const item of content) {
    uris.push(item.uri);
    item.context.collections = collImpl.onArchive({ [item.uri]: Sequence.from(item.context.originalCollections) }, mergeOptions.xpath('(mergeOptions/algorithms/collections|targetCollections)/onArchive'));
  }
  let mergedDocument = fn.head(merging.buildMergeModelsByUri(uris, mergeOptions));
  let contentArray = hubUtils.normalizeToArray(content);
  contentArray.push(mergedDocument['audit-trace']);
  let filteredContent = contentArray.filter((item) => item.uri !== mergedDocument.uri);
  return Sequence.from(filteredContent.concat([mergedDocument]));
}

export {
  main
};
