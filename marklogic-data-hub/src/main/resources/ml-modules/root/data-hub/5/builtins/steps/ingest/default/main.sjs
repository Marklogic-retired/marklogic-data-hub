const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(id, content, options) {
  let lib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');

  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  if(outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    datahub.flow.debug.log({message: 'The output format of type '+outputFormat+' is invalid. Valid options are '+datahub.flow.consts.XML+' or '+datahub.flow.consts.JSON+'.', type: 'error'});
    throw Error('The output format of type '+outputFormat+' is invalid. Valid options are '+datahub.flow.consts.XML+' or '+datahub.flow.consts.JSON+'.');
  }

  //TODO: make this work with xml, json, AND binary data coming in, for now it's just json

  let instance = content;
  let triples = [];
  let headers = {};

  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return envelope;
}

module.exports = {
  main: main
};
