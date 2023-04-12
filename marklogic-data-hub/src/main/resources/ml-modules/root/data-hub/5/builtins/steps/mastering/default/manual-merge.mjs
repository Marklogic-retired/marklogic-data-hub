import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import Mergeable from "/data-hub/5/mastering/merging/mergeable.mjs";
import masteringStepLib from "/data-hub/5/builtins/steps/mastering/default/lib.mjs";
import {ThresholdDefinition} from "/data-hub/5/mastering/matching/matchable.mjs";

const quickStartRequiredOptionProperty = 'mergeOptions';
const hubCentralRequiredOptionProperty = 'mergeRules';

function main(content, options) {
  masteringStepLib.checkOptions(null, options, null, [[quickStartRequiredOptionProperty,hubCentralRequiredOptionProperty]]);

  const mergeable = new Mergeable(options);
  const thresholdObj = {action: "merge"};
  const threshold = new ThresholdDefinition(thresholdObj, null); 
  let contentArray = hubUtils.normalizeToArray(content);
  const uri = threshold.generateActionURI(contentArray);
  let mergedDocument = {
    uri: uri, 
    previousUri: contentArray.map(c => c.uri), 
    value: mergeable.buildMergeDocument(contentArray), 
    context: {
      collections: [],
      permissions: []
    }}
  for (const contentToArchive of contentArray) {
    contentToArchive.context.collections = [];
    mergeable.applyDocumentContext(contentToArchive, {action: "archive"});
  }
  mergeable.applyDocumentContext(mergedDocument, thresholdObj);
  let filteredContent = contentArray.filter((item) => item.uri !== mergedDocument.uri);
  return Sequence.from(filteredContent.concat([mergedDocument]));
}

export default {
  main
};
