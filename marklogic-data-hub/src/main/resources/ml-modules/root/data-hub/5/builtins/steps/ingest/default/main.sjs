const sem = require("/MarkLogic/semantics.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(id, content, options) {
  let lib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');

  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  if(outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    var errMsg = 'The output format of type '+outputFormat+' is invalid. Valid options are '+datahub.flow.consts.XML+' or '+datahub.flow.consts.JSON+'.';
    datahub.flow.debug.log({message: errMsg, type: 'error'});
    throw Error(errMsg);
  }
  //TODO: make this work with xml, json, AND binary data coming in, for now it's just json
  let instance = content;

  let triples = [];
  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
    }
  }

  let headers = createHeaders(id, content, options);
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return envelope;
}

function createHeaders(id, content, options) {
  let headers = {};
  for (let key in options.headers) {
    headers[key] = options.headers[key];
    if (headers[key] == datahub.flow.consts.CURRENT_DATE_TIME) {
      headers[key] = fn.currentDateTime;
    } else if (headers[key] == datahub.flow.consts.CURRENT_USER) {
      headers[key] = xdmp.getCurrentUser();
    }
  }
  return headers;
}

module.exports = {
  main: main
};
