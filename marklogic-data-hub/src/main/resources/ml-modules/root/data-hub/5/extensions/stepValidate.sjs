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
    const datahub = DataHubSingleton.instance();
    let flow = datahub.flow.getFlow(flowName);
    let stepRef = flow.steps[stepNumber];
    let stepDetails = datahub.flow.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
    let modPath = stepDetails.modulePath;
    let response, validationOutput, modPerms;

    let operatorRole = xdmp.role(datahub.config.FLOWOPERATORROLE).toString();
    try{
      modPerms = fn.head(datahub.hubUtils.queryLatest(function () {
      if (fn.docAvailable(modPath)){
        return xdmp.documentGetPermissions(modPath);
      }
      return fn.error(xs.QName("ERROR"), "Module " + modPath + " not found");
      },datahub.config.MODULESDATABASE));
    }
    catch (ex) {
      response =  {"valid":false, "response" : "Module " + modPath + " not found."};
      return response;
    }

    if(!checkPermissions(modPerms, operatorRole)) {
      response =  {"valid":false, "response" : "The 'flowOperator' role must have read and execute capability on module " + modPath};
      return response;
    }

    validationOutput = staticCheck(modPath);
    if (!validationOutput) {
      response =  {"valid":true, "response" : "Module " + modPath + " is valid."};
    }
    else {
      response = {"valid": false, "response": validationOutput};
    }
    return response;
  }
}

function checkPermissions(modPerms, operatorRole) {
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
    return false;
  }
  return true;
}

function staticCheck(modPath) {
  let errResp;
  try{
      xdmp.eval("var x=require('" + modPath + "');", {"staticCheck":fn.true()})
  }
  catch (err){
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
  }
  return errResp;
}

exports.GET = get;
exports.POST = post;
exports.checkPermissions = checkPermissions;
exports.staticCheck = staticCheck;
