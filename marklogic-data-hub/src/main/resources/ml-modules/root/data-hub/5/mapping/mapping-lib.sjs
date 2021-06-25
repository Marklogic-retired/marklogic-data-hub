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
    case "XDMP-COMPUTE":
      errorMessage = `Cannot compute. Cause: The provided argument(s) for a mapping expression include invalid values.`;
      break;
    case "XDMP-LEXVAL":
      errorMessage = extractInvalidLexicalValueError(e);
      break;
    case "XSLT-BADXPATH":
      errorMessage = extractBadXPathError(e);
      break;
    case "XDMP-TOOFEWARGS":
    case "XDMP-TOOMANYARGS":
      errorMessage = extractIncorrectNumberOfArgumentsError(e);
      break;
    default:
      errorMessage = null;
  }
  return errorMessage;
}

function extractBadXPathError(e) {
  const expression = e.data[0];
  const errorInfo = e.data[1];
  let errorMessage = null;
  if(errorInfo.startsWith("XDMP-UNEXPECTED")){
    if(errorInfo.includes("unexpected Rpar_")){
      errorMessage = `Invalid XPath expression: '${expression}'. Cause: Unexpected right parenthesis.`;
    }
    else if(errorInfo.includes("expecting Rpar_")){
      errorMessage = `Invalid XPath expression: '${expression}'. Cause: Missing right parenthesis.`;
    }
    else if(errorInfo.includes("unexpected Comma_")){
      errorMessage = `Invalid XPath expression: '${expression}'. Cause: Unexpected comma.`;
    }
    else if(errorInfo.includes("Unexpected token syntax error")){
      errorMessage = `Invalid XPath expression: '${expression}'. Cause: Unexpected character.`;
    }
  }
  else if(errorInfo.startsWith("XDMP-BADCHAR")){
    errorMessage = `Invalid XPath expression: '${expression}'. Cause: Unexpected character.`
  }
  return errorMessage;
}

function extractInvalidLexicalValueError(e) {
  const error = new Error(e);
  const mappedValue = e.data[0];
  const regex = /^XDMP-LEXVAL: xs:(\w+).*$/;
  let errorMessage = error.message;
  const expectedDataType = errorMessage.match(regex)[1];
  if(expectedDataType){
    errorMessage = `Data type mismatch. Cause: Returned type value (${mappedValue}) from a mapping expression does not match expected property type (${expectedDataType}).`
  }
  return errorMessage;
}

function extractErrorMessageForMappingUI(e){
  let errorMessage = extractFriendlyErrorMessage(e);
  return errorMessage ? errorMessage : hubUtils.getErrorMessage(e);
}

function extractIncorrectNumberOfArgumentsError(e) {
  const error = new Error(e);
  let errorMessage = error.message;
  const regex = /^(XDMP-TOOMANYARGS|XDMP-TOOFEWARGS): \(err:XPST0017\) fn:(.+) -- Too (many|few) args, expected (\d+) but got (\d+)$/;
  const extractedError = errorMessage.match(regex);
  if(extractedError){
    errorMessage = `Wrong number of arguments: '${extractedError[2]}'. Cause: Requires ${extractedError[4]} arguments but received ${extractedError[5]}.`;
  }
  return errorMessage;
}

module.exports = {
  extractErrorMessageForMappingUI,
  extractFriendlyErrorMessage
};
