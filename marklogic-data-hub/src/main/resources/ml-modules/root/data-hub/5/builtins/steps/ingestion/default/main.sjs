const sem = require("/MarkLogic/semantics.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {
  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML && outputFormat !== datahub.flow.consts.BINARY && outputFormat !== datahub.flow.consts.TEXT) {
    let errMsg = 'The output format of type ' + outputFormat + ' is invalid. Valid options are '
      + datahub.flow.consts.XML + ' , ' + datahub.flow.consts.JSON + ', '+ datahub.flow.consts.TEXT +' or' + datahub.flow.consts.BINARY + '.';
    datahub.debug.log({message: errMsg, type: 'error'});
    throw Error(errMsg);
  }

  let instance = content.value.root || content.value;
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === datahub.flow.consts.BINARY || outputFormat === datahub.flow.consts.TEXT) {
    return content;
  }
  else if (instance.nodeType === Node.TEXT_NODE) {
    try {
      let options;
      if(outputFormat === datahub.flow.consts.XML) {
        options = "format-xml";
      }
      else {
        options = "format-json";
      }
      instance = fn.head(xdmp.unquote(instance, null, options));
    }
    catch (e) {
      let errMsg = 'The input text document is not a valid ' + outputFormat + ' .';
      datahub.debug.log({message: errMsg, type: 'error'});
      throw Error(errMsg);
    }
  }

  let triples = [];
  let headers = datahub.flow.flowUtils.createHeaders(options);

  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
    }
  }

  content.value = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return content;

}

module.exports = {
  main: main
};
