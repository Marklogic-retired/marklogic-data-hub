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

function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let flowName = params["flow-name"];
  let stepNumber = params["step"];
  if (!fn.exists(flowName)) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([400, "Bad Request", "Invalid request - must specify a flowName"]));
  }
  else if(!fn.exists(stepNumber)) {
    fn.error(null, "RESTAPI-SRVEXERR", Sequence.from([400, "Bad Request", "Invalid request - must specify step number"]));
  }
  else {
    let options = params["options"] ? JSON.parse(params["options"]) : {};
    const datahub = DataHubSingleton.instance({
      performanceMetrics: !!options.performanceMetrics
    });

    let flow = datahub.flow.getFlow(flowName);
    let stepRef = flow.steps[stepNumber];
    let stepDetails = datahub.flow.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
    let modPath = stepDetails.modulePath;
    let output;

    let operatorRole = xdmp.role(datahub.config.FLOWOPERATORROLE).toString();
    let modPerms = fn.head(datahub.hubUtils.queryLatest(function () {
      return xdmp.documentGetPermissions(modPath)
    }, datahub.config.MODULESDATABASE));
    let readCapability = false, executeCapability = false;
    for (let i = 0; i < modPerms.length; i++) {
      if (modPerms[i].roleId === operatorRole) {
        if (modPerms[i].capability === "read") {
          readCapability = true;
        }
        if (modPerms[i].capability === "execute") {
          executeCapability = true;
        }
      }
    }
    if(!(readCapability && executeCapability)) {
      output =  {"valid":false, "response" : "The 'flowOperator' role must have read and execute capability on module " + modPath};
      return output;
    }
    try{
      xdmp.eval("var x=require('" + modPath + "');", {"staticCheck":fn.true()})
    }
    catch (err){
      let errResp;
      if(err.stack) {
        let stackLines = err.stack.split("\n");
        errResp = stackLines[0] + " " + stackLines[1];
      }
      else if (err.stackFrames) {
        errResp =  err.message + ": " + err.data[0] + " in " + err.stackFrames[0].uri + " at " + err.stackFrames[0].line;
      }
      else {
        errResp = "Invalid Module";
      }
      output = {"valid": false, "response": errResp};
    }
    if (!output) {
      output =  {"valid":true, "response" : "Module " + modPath + " is valid."};
    }

    return output;
  }
}

function put(context, params, input) {
}

function deleteFunction(context, params) {
}

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
