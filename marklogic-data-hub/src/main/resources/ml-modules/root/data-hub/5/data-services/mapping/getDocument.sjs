/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

xdmp.securityAssert('http://marklogic.com/data-hub/privileges/read-mapping', 'execute');

const core = require('/data-hub/5/artifacts/core.sjs')
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const sourcePropsLib = require('./sourcePropertiesLib.sjs');
const FlowExecutionContext = require("/data-hub/5/flow/flowExecutionContext.sjs");
const StepExecutionContext = require("/data-hub/5/flow/stepExecutionContext.sjs");

var stepName, uri;

const response = {
  data: null,
  namespaces: {},
  format: null,
  sourceProperties: []
}

// Offer the mapping step to define the doc's database.
const mappingStep = core.getArtifact('mapping', stepName);
let originalDoc;
if (mappingStep.sourceDatabase) {
  originalDoc = fn.head(xdmp.eval(`cts.doc('${uri}')`, null, {database: xdmp.database(mappingStep.sourceDatabase)}));
} else {
  originalDoc = cts.doc(uri);
}

if (originalDoc === null) {
  httpUtils.throwNotFound(`Could not find a document with URI: ${uri}`);
}

const inlineMappingStep = Artifacts.convertStepReferenceToInlineStep(mappingStep.stepId, null);

const flow = {
  "name" : "inMemoryFlow-" + stepName,
  "steps" : {
    "1": inlineMappingStep
  }
}

const flowExecutionContext = new FlowExecutionContext(flow, null, null, [1]);
const stepExecutionContext = StepExecutionContext.newContext(flowExecutionContext, 1);

const contentArray = [];
let content = {};
content.uri = uri;
content.value = originalDoc;
contentArray.push(content);

try{
  flowRunner.invokeInterceptors(stepExecutionContext, contentArray, "beforeMain");
}
catch(e){
  httpUtils.throwBadRequest("Interceptor execution failed;cause: " + Error(e).message);
}

let doc = contentArray[0].value;

// Populate return object.
response.format = originalDoc.documentFormat;
const isJson = response.format.toUpperCase() === 'JSON';
if (isJson) {
  if (mappingStep.sourceRecordScope === "entireRecord") {
    response.data = doc;
  } else {
    if (doc instanceof Node) {
      doc = doc.toObject();
    }
    response.data = (doc.hasOwnProperty('envelope') && doc.envelope.hasOwnProperty('instance')) ?
      doc.envelope.instance : doc;
  }

} else {
  let xmlNode;
  if (mappingStep.sourceRecordScope === "entireRecord") {
    xmlNode = doc;
  } else {
    xmlNode = fn.head(doc.xpath("/es:envelope/es:instance/node()", {"es":"http://marklogic.com/entity-services"}))
    if (xmlNode === null) {
      xmlNode = doc;
    }
  }

  const transformResult = require('./xmlToJsonForMapping.sjs').transform(xmlNode);
  response.data = transformResult.data;

  response.namespaces = Object.assign({ "entity-services": "http://marklogic.com/entity-services"}, transformResult.namespaces);
}
response.sourceProperties = sourcePropsLib.buildSourceProperties(response.data, isJson);

response;
