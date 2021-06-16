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
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

function extractFriendlyErrorMessage(e){
  let errorMessage;
  switch(e.name){
    case "XDMP-UNDFUN":
      errorMessage = `Unable to find function: '${e.data[0]}'. Cause: Either the function does not exist or the wrong number of arguments were specified.`;
      break;
    case "XDMP-ARGTYPE":
      errorMessage = `Invalid argument. Cause: Either the argument to the function in a mapping expression is not the right type, or the function does not expect arguments.`;
      break;
    default:
      errorMessage = null;
  }
  return errorMessage;
}

function extractErrorMessageForMappingUI(e){
  let errorMessage = extractFriendlyErrorMessage(e);
  return errorMessage ? errorMessage : hubUtils.getErrorMessage(e);
}

module.exports = {
  extractErrorMessageForMappingUI,
  extractFriendlyErrorMessage
};
