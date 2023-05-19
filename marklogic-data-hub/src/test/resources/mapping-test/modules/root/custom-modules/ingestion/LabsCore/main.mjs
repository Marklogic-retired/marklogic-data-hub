import DataHub from  "/data-hub/5/datahub.mjs";
const datahub = new DataHub();
import flowUtils from "/data-hub/5/impl/flow-utils.mjs";

function main(content, options) {

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  let instance = content.value.root || content.value;
  if (instance.nodeType === "binary" || outputFormat === datahub.flow.consts.BINARY || outputFormat === datahub.flow.consts.TEXT) {
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

export default {
  main
};
