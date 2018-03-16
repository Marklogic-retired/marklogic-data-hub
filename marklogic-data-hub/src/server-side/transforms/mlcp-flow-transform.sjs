/**
  Copyright 2012-2018 MarkLogic Corporation

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

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/MarkLogic/data-hub-framework/impl/consts.sjs");
const flowlib = require("/MarkLogic/data-hub-framework/impl/flow-lib.sjs");
const tracelib = require("/MarkLogic/data-hub-framework/impl/trace-lib.sjs");

function transform(content, context) {
  let uri = content.uri;
  let params = {};
  let splits = context.transform_param.split(',');
  for (let i in splits) {
    let pair = splits[i];
    let parts = pair.split('=');
    params[parts[0]] = parts[1];
  }

  let jobId = params["job-id"] || sem.uuidString();
  let entityName = params['entity-name'] ? xdmp.urlDecode(params['entity-name']) : null;
  let flowName = params['flow-name'] ?  xdmp.urlDecode(params['flow-name']) : null;
  let flow = flowlib.getFlow(entityName, flowName, consts.INPUT_FLOW);

  if (!flow) {
    fn.error(xs.QName("MISSING_FLOW"), "The specified flow " + params.flow + " is missing.");
  }

  // configure the options
  let options = {};
  if (params.options) {
    options = JSON.parse(params.options);
  }
  flowlib.setDefaultOptions(options, flow);

  let mainFunc = flowlib.getMainFunc(flow.main);

  // this can throw, but we want MLCP to know about problems, so let it
  let envelope = flowlib.runFlow(jobId, flow, uri, content.value, options, mainFunc);

  // write the trace for the current identifier
  let itemContext = flowlib.contextQueue[uri];
  tracelib.writeTrace(itemContext);

  content.value = envelope;
  return content;
}

exports.transform = transform;
