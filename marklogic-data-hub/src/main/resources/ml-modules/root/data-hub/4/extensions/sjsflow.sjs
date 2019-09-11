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

function get(context, params) {
  let entityName = params["entity-name"];
  let flowName = params["flow-name"];
  let flowType = params["flow-type"];
  let resp = null;
  if (fn.exists(flowName)) {
    let flow = flowlib.getFlow(entityName, flowName, flowType);
    if (fn.exists(flow)) {
      resp = flow;
    }
    else {
      fn.error(null,"RESTAPI-SRVEXERR",  Sequence.from([404, "Not Found", "The requested flow was not found"]));
    }
  } else {
    resp = flowlib.getFlows(entityName);
  }
  return resp;
};

function post(context, params, input) {
  let entityName = params["entity-name"];
  let flowName = params["flow-name"];
  let flowType = consts.HARMONIZE_FLOW
  let jobId = params["job-id"];

  let targetDatabase = null;
  if (params["target-database"]) {
    targetDatabase = xdmp.database(params["target-database"]);
  }
  else {
    targetDatabase = xdmp.database(config.FINALDATABASE);
  }

  let identifiers = [].concat(params.identifiers);
  let flow = flowlib.getFlow(entityName, flowName, flowType);

  if (!flow) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", "The specified flow " + entityName + ":" + flowName + " is missing."]));
  }

  // add the default options from the flow
  let options = {};
  if (params.options) {
    options = JSON.parse(params.options);
  }
  flowlib.setDefaultOptions(options, flow);
  options["target-database"] = targetDatabase;

  let errors = [];
  let resp = null;

  if (flow) {
    let mainFunc = flowlib.getMainFunc(flow.main);
    let i = 0;
    for (i = 0; i < identifiers.length; i++) {
      let identifier = identifiers[i];
      try {
        resp = flowlib.runFlow(jobId, flow, identifier, null, options, mainFunc);
      }
      catch(ex) {
        xdmp.log(['error in runFlow:', ex.toString()]);
        errors.push(ex);
      }
    }

    let before = xdmp.elapsedTime();
    try {
      flowlib.runWriters(identifiers);
    }
    catch(ex) {
      xdmp.log(["error in runWriters", ex.toString()]);
      errors.push(ex);
      const batchFailedError = {
        "message": "BATCH-FAILED: " + ex.message,
        "stack": "BATCH-FAILED: " + ex.stack,
        "stackFrames": ex.stackFrames
      };
      const unmodifiedError = {
        "message": ex.message,
        "stack": ex.stack,
        "stackFrames": ex.stackFrames
      };
      for (const identifier of identifiers) {
        let err = batchFailedError;
        // check if the error is connected to this specific document
        if (Array.isArray(ex.data) && !!ex.data.find((val) => val === identifier)) {
          // if so, pass the original error unmodified
          err = unmodifiedError;
        }
        tracelib.errorTrace(flowlib.contextQueue[identifier], err, xdmp.elapsedTime().subtract(before));
      }
    }

    resp = {
      "totalCount": identifiers.length,
      "errorCount": tracelib.getErrorCount(),
      "completedItems": tracelib.getCompletedItems(),
      "failedItems": tracelib.getFailedItems(),
      "errors": errors
    }
    if(resp.errorCount > 0){
      fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([400, "Plugin error", resp]));
    }
  }
  else {
    resp = 'error';
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([404, "Not Found", "The requested flow was not found"]));
  }

  return resp;
};

function put(context, params, input) {};

function deleteFunction(context, params) {};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
