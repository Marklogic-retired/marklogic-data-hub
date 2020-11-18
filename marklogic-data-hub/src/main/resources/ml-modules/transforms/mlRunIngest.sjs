'use strict';
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

function transform(context, params, content) {
  let flowName = params['flow-name'] ? xdmp.urlDecode(params['flow-name']) : "default-ingestion";
  let flow = datahub.flow.getFlow(flowName);
  if (!flow) {
    datahub.debug.log({message: params, type: 'error'});
    httpUtils.throwNotFoundWithArray(["Not Found", "The specified flow " + flowName + " is missing."]);
  }

  let step = params['step'] ? xdmp.urlDecode(params['step']) : params['flow-name'] ? null : 1;
  let stepObj = flow.steps[step];
  if(!stepObj) {
    datahub.debug.log({message: params, type: 'error'});
    httpUtils.throwNotFoundWithArray(["Not Found", "The specified step "+ step + " is missing in  " + flowName]);
  }
  if(! stepObj.stepDefinitionType.toLowerCase() === "ingestion"){
    datahub.debug.log({message: params, type: 'error'});
    httpUtils.throwBadRequestWithArray(["Invalid Step Type", "The specified step "+ step + " is not an ingestion step"]);
  }

  let jobId = params["job-id"];
  let options = params.options ? JSON.parse(params.options) : {};

  if(options.inputFileType && options.inputFileType.toLowerCase() === "csv") {
    content = JSON.parse(content);
    options.file = content.file;
    content = content.content;
  }

  options.noWrite = true;
  options.fullOutput = true;
  options.noBatchWrite=true;

  let newContent = {};
  newContent.uri=context.uri;
  newContent.value=content;

  let flowContent = [];
  flowContent.push(newContent);

  let flowResponse = datahub.flow.runFlow(flowName, jobId, flowContent, options, step);
    if (flowResponse.errors && flowResponse.errors.length) {
      datahub.debug.log(flowResponse.errors[0]);
      fn.error(null, flowResponse.errors[0].message, flowResponse.errors[0].stack);
    }
    let documents = flowResponse.documents;
    if (documents && documents.length) {
      Object.assign(context, documents[0].context);
    }
    let docs = [];
    for (let doc of documents) {
      delete doc.context;
      if (!doc.value) {
        datahub.debug.log({message: params, type: 'error'});
        httpUtils.throwNotFoundWithArray(["Null Content", "The content was null in the flow " + flowName + " for " + doc.uri + "."]);
      }
      else {
        docs.push(doc.value);
      }
    }
   return Sequence.from(docs);
}

exports.transform = transform;
