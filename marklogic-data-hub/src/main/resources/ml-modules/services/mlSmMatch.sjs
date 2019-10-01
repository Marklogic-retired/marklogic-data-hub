/**
 Copyright 2012-2019 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const matcher = require('/com.marklogic.smart-mastering/matcher.xqy');

function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let inputBody = input ? input.root : {};
  let inputOptions = inputBody.options || {};
  const datahub = DataHubSingleton.instance({
    performanceMetrics: !!inputOptions.performanceMetrics
  });
  let uri = params.uri;
  let inMemDocument = inputBody.document;
  if (!(uri || inMemDocument)) {
    fn.error(null,'RESTAPI-SRVEXERR',
      Sequence.from([400, 'Bad Request',
        'A valid uri parameter or document in the POST body is required.']));
  }
  let refFlowName = params.flowName;
  if (!refFlowName) {
    fn.error(null,'RESTAPI-SRVEXERR',
      Sequence.from([400, 'Bad Request',
        'A flow name must be provided.']));
  }
  let refStepNumber = params.step || '1';
  let flow = datahub.flow.getFlow(refFlowName);
  let stepRef = flow.steps[refStepNumber];
  if (stepRef.stepDefinitionType.toLowerCase() !== 'mastering') {
    fn.error(null,'RESTAPI-SRVEXERR',
      Sequence.from([400, 'Bad Request',
        'The step must be a mastering step.']));
  }
  let stepDetails = datahub.flow.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
  // build combined options
  let flowOptions = flow.options || {};
  let stepRefOptions = stepRef.options || {};
  let stepDetailsOptions = stepDetails.options || {};
  let combinedOptions = Object.assign({}, stepDetailsOptions, flowOptions, stepRefOptions, inputOptions, params);
  let sourceDatabase = combinedOptions.sourceDatabase || datahub.flow.globalContext.sourceDatabase;
  let matchOptions = new NodeBuilder().addNode({ options: combinedOptions.matchOptions }).toNode();
  return fn.head(datahub.hubUtils.queryLatest(
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
}

exports.GET = get;
exports.POST = post;
