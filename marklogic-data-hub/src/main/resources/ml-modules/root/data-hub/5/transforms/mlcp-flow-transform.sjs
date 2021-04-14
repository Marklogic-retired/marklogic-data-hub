/**
  Copyright (c) 2021 MarkLogic Corporation

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
const datahub = DataHubSingleton.instance();

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const consts = require("/data-hub/5/impl/consts.sjs");
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

const urisInBatch = [];
for (let requestField of xdmp.getRequestFieldNames()) {
  let fieldValue = fn.head(xdmp.getRequestField(requestField));
  if (fieldValue === "URI") {
    urisInBatch.push(fn.head(xdmp.getRequestField(fn.replace(requestField, "^evl","evv"))));
  }
}
const visitedURIs = [];
const urisToContent = {};

function transform(content, context = {}) {
  const contentUri = content.uri;
  urisToContent[contentUri] = content;
  visitedURIs.push(contentUri);

  if (urisInBatch.every((uri) => visitedURIs.includes(uri))) {
    let params = {};
    let optionsString = null;
    let parsedTransformParam = null;
    let transformString = context.transform_param ? context.transform_param : '';
    let pattern = '^.*(options=\{.*\}).*$';
    let match = new RegExp(pattern).exec(transformString);
    if (match === null) {
      parsedTransformParam = transformString;
    } else {
      optionsString = match[1];
      parsedTransformParam = transformString.replace(optionsString, '');
    }

    let splits = parsedTransformParam.split(',');
    for (let i in splits) {
      let pair = splits[i];
      let parts = pair.split('=');
      params[parts[0]] = parts[1];
    }

    const flowName = params['flow-name'] ? xdmp.urlDecode(params['flow-name']) : "default-ingestion";
    if (flowName === 'default-ingestion') {
      context.collections.push('default-ingestion');
    }

    // Don't need getFullFlow, as we don't need any step config
    const theFlow = Artifacts.getArtifact("flow", flowName);
    const jobId = params["job-id"] || `mlcp-${xdmp.transaction()}`;

    const options = optionsString ? parseOptionsString(optionsString, contentUri) : {};
    options.sourceName = params["sourceName"];
    options.sourceType = params["sourceType"];

    const contentArray = buildContentArray(context);

    if (runStepsInMemory(theFlow, options)) {
      // Let errors propagate to MLCP
      options.throwStepError = true;
      flowRunner.processContentWithFlow(flowName, contentArray, jobId, options);
      return Sequence.from([]);
    } else {
      const step = params['step'] ? xdmp.urlDecode(params['step']) : null;
      options.writeStepOutput = false;
      options.fullOutput = true;
      // This maps to the ResponseHolder Java class; it's not a RunFlowResponse or RunStepResponse
      const responseHolder = datahub.flow.runFlow(flowName, jobId, contentArray, options, step);
      
      // If the flow response has an error, propagate it up to MLCP so MLCP can report it
      if (responseHolder.errors && responseHolder.errors.length) {
        httpUtils.throwBadRequestWithArray([`Flow failed with error: ${responseHolder.errors[0].stack}`, contentUri]);
      }

      const contentDocuments = responseHolder.documents;
      if (contentDocuments && contentDocuments.length) {
        Object.assign(context, contentDocuments[0].context);
        for (let doc of contentDocuments) {
          delete doc.context;
          if (!doc.value) {
            httpUtils.throwNotFoundWithArray([`No content.value defined for URI: ${doc.uri}`, doc.uri]);
          }
        }
        return Sequence.from(contentDocuments);
      }
    }
  } else {
    return Sequence.from([]);
  }
}

function buildContentArray(context) {
  const contentArray = [];
  Object.keys(urisToContent).forEach(uri => {
    // Sanity check, though uri/value should always exist when MLCP passes a content object to a transform
    if (urisToContent.hasOwnProperty(uri)) {
      let content = urisToContent[uri];
      if (content.value) {
        content.context = context;
        contentArray.push(content);
      }
    }
  });
  return contentArray;
}

function parseOptionsString(optionsString, contentUri) {
  var tokens = optionsString.split("=");
  if (tokens.length < 2) {
    // Using console.log so this always appears
    console.log("Unable to parse JSON options; expecting options={json object}; found: " + optionsString);
    return {};
  }
  try {
    const options = JSON.parse(optionsString.split("=")[1]);
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Parsed options into JSON object: ${xdmp.toJsonString(options)}`);
    return options;
  } catch (e) {
    httpUtils.throwBadRequestWithArray([`Could not parse JSON options; cause: ${e.message}`, contentUri]);
  }
}

function runStepsInMemory(theFlow, options) {
  const mode = "in-memory";
  if (theFlow.stepConnectionMode == mode || options.stepConnectionMode == mode) {
    hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, "Will runs steps with in-memory connection mode");
    return true;
  }
  return false;
}

exports.transform = transform;
