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
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const [DataHubSingleton, httpUtils, hubUtils] = mjsProxy.requireMjsModules(
  "/data-hub/5/datahub-singleton.mjs",
  "/data-hub/5/impl/http-utils.mjs",
  "/data-hub/5/impl/hub-utils.mjs");

function get(context, params) {
  return post(context, params, null);
}

function post(context, params, input) {
  let flowName = params["flow-name"];
  let stepNumber = params["step"];
  if (!fn.exists(flowName)) {
    httpUtils.throwBadRequestWithArray(["Bad Request", "Invalid request - must specify a flowName"]);
  }
  else if(!fn.exists(stepNumber)) {
    httpUtils.throwBadRequestWithArray(["Bad Request", "Invalid request - must specify step number"]);
  }
  else {
    let options = params["options"] ? JSON.parse(params["options"]) : {};
    const datahub = DataHubSingleton.instance();
    let flow = datahub.flow.getFlow(flowName);
    let stepRef = flow.steps[stepNumber];
    let stepDetails = datahub.flow.stepDefinition.getStepDefinitionByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);
    let modPath = stepDetails.modulePath;
    let response, validationOutput, modPerms;

    let operatorRole = xdmp.role(datahub.config.FLOWOPERATORROLE).toString();
    try{
      modPerms = fn.head(hubUtils.invokeFunction(function () {
        if (fn.docAvailable(modPath)){
          return xdmp.documentGetPermissions(modPath);
        }
        return httpUtils.throwBadRequest("Module " + modPath + " not found");
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

function formatError(err, lineIndex = 0) {
  if (err.stack) {
    let stackLines = err.stack.split("\n");
    return stackLines[0] + " " + stackLines[1];
  }
  if (err.stackFrames) {
    return err.message + ": " + err.data[0] + " in " + err.stackFrames[0].uri + " at " + err.stackFrames[0].line;
  }
  return "Invalid Module";
}
function staticCheck(modPath) {
  if (fn.endsWith(modPath, ".mjs")) {
    return staticCheckMJS(modPath);
  }
  try {
    xdmp.eval("let x = require('" + modPath + "');", {"staticCheck": fn.true()});
  } catch (err) {
    return formatError(err);
  }
}

function staticCheckMJS(modPath) {
  try {
    evalModule("import x from '" + modPath + "';");
  } catch (err) {
    let formattedError = formatError(err);
    // MJS error traces can point to the current module
    if (fn.contains(formattedError, "/marklogic.rest.resource/mlStepValidate/assets/resource.sjs")) {
      formattedError = fn.substringBefore(formattedError, "/marklogic.rest.resource/mlStepValidate/assets/resource.sjs") + modPath;
    }
    return formattedError;
  }
}

exports.GET = get;
exports.POST =  post;
exports.checkPermissions = checkPermissions;
exports.staticCheck = staticCheck;
exports.staticCheckMJS = staticCheckMJS;
