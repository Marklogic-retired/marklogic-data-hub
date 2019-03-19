const sem = require("/MarkLogic/semantics.xqy");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {
  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    let errMsg = 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.';
    datahub.debug.log({message: errMsg, type: 'error'});
    throw Error(errMsg);
  }

  let instance = content.value.root || content.value;
  if (instance.nodeType === Node.BINARY_NODE || outputFormat === datahub.flow.consts.BINARY) {
    return content;
  } else {
    let triples = [];
    let headers = datahub.flow.flowUtils.createHeaders(options);

    if (options.triples && Array.isArray(options.triples)) {
      for (let triple of options.triples) {
        triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
      }
    }

    //set the content value which is our envelope
    content.value = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

    return content;
  }
}

module.exports = {
  main: main
};
