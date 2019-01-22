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
const consts = require("/data-hub/4/impl/consts.sjs");
const flowlib = require("/data-hub/4/impl/flow-lib.sjs");
const tracelib = require("/data-hub/4/impl/trace-lib.sjs");

function transform(context, params, content) {
  let jobId = params["job-id"] ||sem.uuidString();
  let entityName = params['entity-name'];
  let flowName = params['flow-name'];
  let uri = context.uri;
  let flow = flowlib.getFlow(entityName, flowName, consts.INPUT_FLOW);
  if (!flow) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", "The specified flow " + entityName + ":" + flowName + " is missing."]));
  }

  // configure the options
  let options = {};
  if (params.options) {
    options = JSON.parse(params.options);
  }
  flowlib.setDefaultOptions(options, flow);

  // this can throw, but we want the REST API to know about problems, so let it
  let mainFunc = flowlib.getMainFunc(flow.main);
  let envelope = flowlib.runFlow(jobId, flow, uri, content, options, mainFunc);

  // write the trace for the current identifier
  let itemContext = flowlib.contextQueue[uri];
  tracelib.writeTrace(itemContext);

  return envelope;
}

exports.transform = transform;
