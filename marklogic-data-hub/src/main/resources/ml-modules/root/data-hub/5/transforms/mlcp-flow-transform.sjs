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

  let jobId = params["job-id"] || null;
  let step = params['step'] ? xdmp.urlDecode(params['step']) : null;
  let flowName = params['flow-name'] ?  xdmp.urlDecode(params['flow-name']) : null;
  let flow = datahub.flow.getFlow(flowName);

  if (!flow) {
    datahub.debug.log({message: params, type: 'error'});
    fn.error(null, "RESTAPI-SRVEXERR", "The specified flow " + flowName + " is missing.");
  }
  let options = {};
  if (optionsString) {
    let splits = optionsString.split("=");
    options = JSON.parse(splits[1]);
  }

  //don't catch any exception here, let it slip through to mlcp
  let document = datahub.flow.runFlow(flowName, options, jobId, step);

  if(!document) {
    datahub.debug.log({message: params, type: 'error'});
    fn.error(null, "RESTAPI-SRVEXERR", "The content was null in the flow " + flowName + " for "+uri+".");
  }

  content.value = document;
  //let's set some metadata content for our createdOn datetime field
  context.metadata.createdOn = fn.currentDateTime();
  return content;
}

exports.transform = transform;
