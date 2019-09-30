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

function get(context, params) {
  let xpathFunctions = getXpathFunctions();
  let mlFunctions = getMarkLogicFunctions();
  return Object.assign({}, mlFunctions, xpathFunctions);
}

function getMarkLogicFunctions() {
  let mlFunctions = fn.head(datahub.hubUtils.queryLatest(function() {
      let fnMetadata = fn.collection("http://marklogic.com/entity-services/function-metadata")
      let ns = {"m":"http://marklogic.com/entity-services/mapping"};
      let output = {};
    
      for (const metaData of fnMetadata){
        if(metaData.xpath("/m:function-defs",ns)) {
          let j = 1;
          let fnLocation = metaData.xpath("/m:function-defs/@location",ns)
          for (const mlFunction of metaData.xpath("/m:function-defs/m:function-def",ns )){
            let funcName = metaData.xpath("/m:function-defs/m:function-def["+j+"]/@name", ns);
            let params = String(metaData.xpath("/m:function-defs/m:function-def["+j+"]/m:parameters/m:parameter/@name",ns)).replace("\n",",");
            j++;
            let singleFunction ={};
            singleFunction["category"] = (String(fnLocation).includes("/data-hub/5/mapping-functions")) ? "builtin" : "custom";
            singleFunction["signature"] = funcName +"("+params+")";
            output[funcName] = singleFunction;
          }
        }
      }
      return output;
  }, datahub.config.MODULESDATABASE));
  return mlFunctions;
}

function getXpathFunctions() {
  let xpathFunctions= xdmp.functions().toObject()
  let response ={};
  for(let i =0; i < xpathFunctions.length;i++){
    if (String(xpathFunctions[i]).includes("fn:")){
      let xpathFunction ={};
      xpathFunction["category"] = "xpath";
      let signature = xdmp.functionSignature(xpathFunctions[i]).replace("function", xdmp.functionName(xpathFunctions[i]));
      signature = signature.match(/fn:(.*?) as.*?/)[1];
      xpathFunction["signature"] = signature;
      response[xdmp.functionName(xpathFunctions[i])] = xpathFunction;
    }
  }
  return response;
}
exports.GET = get;
exports.getMarkLogicFunctions=getMarkLogicFunctions;
exports.getXpathFunctions=getXpathFunctions;
