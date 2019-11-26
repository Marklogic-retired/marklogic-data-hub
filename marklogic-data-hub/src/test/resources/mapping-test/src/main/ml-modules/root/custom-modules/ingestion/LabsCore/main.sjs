const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  let instance = content.value.root || content.value;
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === datahub.flow.consts.BINARY || outputFormat === datahub.flow.consts.TEXT) {
    return content;
  }
  else if (instance.nodeType === Node.TEXT_NODE) {
    instance = datahub.flow.flowUtils.parseText(instance, outputFormat);
  }

  let triples = [];
  let headers = datahub.flow.flowUtils.createHeaders(options);
  content.value = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return content;
}

module.exports = {
  main: main
};
