import DataHub from "/data-hub/5/datahub.mjs";
import flowUtils from "/data-hub/5/impl/flow-utils.mjs";

const datahub = new DataHub();

function main(content, options) {
  let id = content.uri;
  let context = content.context;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let doc = content.value;
  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
    doc = fn.head(doc.root);
  }
  let instance = flowUtils.getInstance(doc).toObject();
  let triples = flowUtils.getTriples(doc) ? flowUtils.getTriples(doc) : [];
  let headers = flowUtils.getHeaders(doc);
  let envelope = flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  content.value = envelope;
  content.uri = id;
  content.context = context;

  return content;
}

export default {
  main: main
};
