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

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/4/impl/consts.sjs");
const flowlib = require("/data-hub/4/impl/flow-lib.sjs");
const tracelib = require("/data-hub/4/impl/trace-lib.sjs");

function transform(content, context) {
  let uri = content.uri;
  let params = {};
  let optionsString = null;
  let parsedTransformParam = null;
  let transformString = context.transform_param;
  let pattern = '^.*(options=\{.*\}).*$';
  let match = new RegExp(pattern).exec(transformString);
  if (match === null){
    parsedTransformParam = transformString;
  }
  else{
    optionsString = match[1];
    parsedTransformParam = transformString.replace(optionsString, '');
  }
  
  let splits = parsedTransformParam.split(',');
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
    fn.error(null, "RESTAPI-SRVEXERR", "The specified flow " + params.flow + " is missing.");
  }
  let options = {};
  if (optionsString) {
    let splits = optionsString.split("=");
    options = JSON.parse(splits[1]);
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
