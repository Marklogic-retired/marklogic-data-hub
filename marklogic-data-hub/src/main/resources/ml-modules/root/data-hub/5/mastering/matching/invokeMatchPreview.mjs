import Artifacts from "/data-hub/5/artifacts/core.mjs";
import config from "/com.marklogic.hub/config.mjs";
import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

const params = external.params;

let inputBody = external.input ? external.input.root || {} : {};
let inputOptions = inputBody.options || {};
const datahub = DataHubSingleton.instance({
  performanceMetrics: !!inputOptions.performanceMetrics
});
let uri = params.uri;
let inMemDocument = inputBody.document;
if (!(uri || inMemDocument)) {
  httpUtils.throwBadRequestWithArray(['Bad Request', 'A valid uri parameter or document in the POST body is required.']);
}
let refFlowName = params.flowName;
if (!refFlowName) {
  httpUtils.throwBadRequestWithArray(['Bad Request', 'A flow name must be provided.']);
}
let refStepNumber = params.step || '1';
let flow = Artifacts.getFullFlow(refFlowName, refStepNumber);
let stepRef = flow.steps[refStepNumber];
if (!(stepRef.stepDefinitionType.toLowerCase() === 'mastering' || stepRef.stepDefinitionType.toLowerCase() === 'matching')) {
  httpUtils.throwBadRequestWithArray(['Bad Request', `The step referenced must be a matching step. Step type: ${stepRef.stepDefinitionType}`]);
}
let stepDetails = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
// build combined options
let flowOptions = flow.options || {};
let stepRefOptions = stepRef.options || {};
let stepDetailsOptions = stepDetails.options || {};
let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, inputOptions, params);
let sourceDatabase = combinedOptions.sourceDatabase || config.STAGINGDATABASE;
let matchOptions = new NodeBuilder().addNode(combinedOptions.matchOptions ? {options: combinedOptions.matchOptions}: combinedOptions).toNode();

fn.head(hubUtils.invokeFunction(
  function() {
    let doc = uri ? cts.doc(uri) : inMemDocument;
    return matcher.resultsToJson(matcher.findDocumentMatchesByOptions(
      doc,
      matchOptions,
      fn.number(params.start || 1),
      fn.number(params.pageLength || 20),
      params.includeMatchDetails === 'true',
      cts.trueQuery()
    ));
  },
  sourceDatabase
));