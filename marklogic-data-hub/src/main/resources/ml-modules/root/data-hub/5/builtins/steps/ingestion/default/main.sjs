const consts = require('/data-hub/5/impl/consts.sjs');
const sem = require("/MarkLogic/semantics.xqy");

const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

function main(content, options) {
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : consts.DEFAULT_FORMAT;
  if (outputFormat !== consts.JSON && outputFormat !== consts.XML && outputFormat !== consts.BINARY && outputFormat !== consts.TEXT) {
    let errMsg = 'The output format of type ' + outputFormat + ' is invalid. Valid options are '
      + consts.XML + ' , ' + consts.JSON + ', '+ consts.TEXT +' or' + consts.BINARY + '.';
    throw Error(errMsg);
  }

  if (content.value === undefined) {
    throw Error(`Content object does not have a 'value' property; unable to ingest; content identifier: ${content.uri}`);
  }

  let instance = content.value.root || content.value;
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === consts.BINARY || outputFormat === consts.TEXT) {
    return content;
  }
  else if (instance.nodeType === Node.TEXT_NODE) {
    try {
      const unquoteOptions = outputFormat === consts.XML ? "format-xml" : "format-json";
      instance = fn.head(xdmp.unquote(instance, null, unquoteOptions));
    }
    catch (e) {
      let errMsg = 'The input text document is not a valid ' + outputFormat + ' .';
      throw Error(errMsg);
    }
  }

  let triples = [];
  let headers = flowUtils.createHeaders(options);

  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
    }
  }

  content.value = flowUtils.makeEnvelope(instance, headers, triples, outputFormat);
  return content;
}

module.exports = {
  main: main
};
