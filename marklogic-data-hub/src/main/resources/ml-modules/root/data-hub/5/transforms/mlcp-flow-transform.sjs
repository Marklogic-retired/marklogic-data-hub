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
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
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
  let currentUri = content.uri;
  urisToContent[currentUri] = content;
  visitedURIs.push(currentUri);
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

    let jobId = params["job-id"] || `mlcp-${xdmp.transaction()}`;
    let step = params['step'] ? xdmp.urlDecode(params['step']) : null;
    let flowName = params['flow-name'] ? xdmp.urlDecode(params['flow-name']) : "default-ingest";
    if (flowName === 'default-ingest') {
      context.collections.push('default-ingest');
    }
    let flow = datahub.flow.getFlow(flowName);

    if (!flow) {
      datahub.debug.log({message: params, type: 'error'});
      fn.error(null, "RESTAPI-SRVEXERR", "The specified flow " + flowName + " is missing.");
    }
    let options = {};
    if (optionsString) {
      let splits = optionsString.split("=");
      options = JSON.parse(splits[1]);
    }
    options.noWrite = true;
    options.fullOutput = true;
    let contentObjs = [];
    for (let uri in urisToContent) {
      if (urisToContent.hasOwnProperty(uri)) {
        let content = urisToContent[uri];
        if (content.value) {
          content.context = context;
          contentObjs.push(content);
        } else {
          datahub.debug.log({message: params, type: 'error'});
          fn.error(null, "RESTAPI-SRVEXERR", "The content was null provided to the flow " + flowName + " for " + uri + ".");
        }
      }
    }
    //don't catch any exception here, let it slip through to mlcp
    let flowResponse = datahub.flow.runFlow(flowName, jobId, contentObjs, options, step);

    // if an array is returned, then it is an array of errors
    if (Array.isArray(flowResponse) && flowResponse.length) {
      fn.error(null, flowResponse[0].message, flowResponse[0]);
    }
    let documents = flowResponse.documents;
    if (documents.type && documents.type === 'error' && documents.message) {
      datahub.debug.log(documents);
      fn.error(null, "RESTAPI-SRVEXERR", documents.message);
    }
    if (documents && documents.length) {
      Object.assign(context, documents[0].context);
    }
    for (let doc of documents) {
      delete doc.context;
      if (doc.type && doc.type === 'error' && doc.message) {
        datahub.debug.log(doc);
        fn.error(null, "RESTAPI-SRVEXERR", doc.message);
      } else if (!doc.value) {
        datahub.debug.log({message: params, type: 'error'});
        fn.error(null, "RESTAPI-SRVEXERR", "The content was null in the flow " + flowName + " for " + doc.uri + ".");
      }
    }
    return Sequence.from(documents);
  } else {
    return Sequence.from([]);
  }
}

exports.transform = transform;
