const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const DataHub = mjsProxy.requireMjsModule("/data-hub/5/datahub.mjs");
const datahub = new DataHub();

const flowUtils = mjsProxy.requireMjsModule("/data-hub/5/impl/flow-utils.mjs");

function main(content, options) {

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  let instance = content.value.root || content.value;
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === datahub.flow.consts.BINARY || outputFormat === datahub.flow.consts.TEXT) {
    return content;
  }
  else if (instance.nodeType === Node.TEXT_NODE) {
    instance = flowUtils.parseText(instance, outputFormat);
  }

  let triples = [];
  let headers = flowUtils.createHeaders(options);
  content.value = flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return content;
}

module.exports = {
  main: main
};
