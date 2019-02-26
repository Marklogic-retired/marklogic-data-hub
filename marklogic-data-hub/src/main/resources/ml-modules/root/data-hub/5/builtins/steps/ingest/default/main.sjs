if(typeof flow === 'undefined'){
  flow = module.exports.flow;
}

function getInstance(instance) {

  if (instance instanceof Element || instance instanceof ObjectNode) {
    let instancePath = '/';
    if(instance instanceof Element) {
      //make sure we grab content root only
      instancePath = '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    instance = new NodeBuilder().addNode(fn.head(instance.xpath(instancePath))).toNode();
  }
  else{
    instance = new NodeBuilder().addNode(fn.head(instance)).toNode();
  }

  return instance;
}

function main(id, rawContent, options) {

  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : this.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : this.flow.consts.DEFAULT_FORMAT;
  if(outputFormat !== this.flow.consts.JSON && outputFormat !== this.flow.consts.XML) {
    this.flow.debug.log({message: 'The output format of type '+outputFormat+' is invalid. Valid options are '+this.flow.consts.XML+' or '+this.flow.consts.JSON+'.', type: 'error'});
    throw Error('The output format of type '+outputFormat+' is invalid. Valid options are '+this.flow.consts.XML+' or '+this.flow.consts.JSON+'.');
  }

  let instance = getInstance(rawContent);
  let triples = [];
  let headers = {};

  let envelope = this.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return envelope;
}

module.exports = {
  main: main
};
