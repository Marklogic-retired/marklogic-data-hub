if(typeof flow === 'undefined'){
  flow = module.exports.flow;
}

function getModel(targetEntity, version = '0.0.1') {
  return xdmp.eval("cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/entity-services/models'), cts.jsonPropertyScopeQuery('info', cts.andQuery([cts.jsonPropertyValueQuery('title', '" + targetEntity + "',['case-insensitive']), cts.jsonPropertyValueQuery('version', '" + version + "',['case-insensitive'])]))]))", null,
    {
      "database": xdmp.schemaDatabase(),
      "ignoreAmps": true,
      "update": 'false'
    })
}

function getMapping(mappingName) {
  return  fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName,['case-insensitive'])]), ["unfiltered", cts.indexOrder(cts.uriReference(), "descending")]));
}

function getMapping(mappingName, version) {
  return fn.head(cts.search(cts.andQuery([cts.collectionQuery('http://marklogic.com/data-hub/mappings'), cts.jsonPropertyValueQuery('name', mappingName,['case-insensitive']), cts.jsonPropertyValueQuery('version', version)])));
}



function processInstance(model, doc) {
  let instance = {

  };

  //first let's get our required props and PK
  let required = model.required;
  if(model.required.indexOf(model.primaryKey) === -1) {
    model.required.push(model.primaryKey);
  }



  return instance;

}

function getInstance(doc) {
  let instance = doc;

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
  if(outFormat !== this.flow.consts.JSON && outFormat !== this.flow.consts.XML) {
    this.flow.debug.log({message: 'The output format of type '+outputFormat+' is invalid. Valid options are '+this.flow.consts.XML+' or '+this.flow.consts.JSON+'.', type: 'error'});
    throw Error('The output format of type '+outputFormat+' is invalid. Valid options are '+this.flow.consts.XML+' or '+this.flow.consts.JSON+'.');
  }

  //let's see if our doc is in the cluster at update time
  if(!fn.docAvailable) {
    this.flow.debug.log({message: 'The document with the uri: '+id+' could not be found.', type: 'error'});
    throw Error('The document with the uri: '+id+' could not be found.')
  }

  //grab the doc
  let doc = cts.doc(id);

  // for json we need to return the instance
 if(doc && doc instanceof Document) {
    doc = fn.head(doc.root);
  }

 //let's prep the instance of the document
  let instance = getInstance(doc);

  //then we grab our mapping
  if(!this.mapping){
    if(options.mapping && options.mapping.name && options.mapping.version) {
      this.mapping = getMapping(options.mapping.name, options.mapping.version);
    } else if(options.mapping && options.mapping.name) {
      this.mapping = getMapping(options.mapping.name);
    } else {
      this.flow.debug.log({message: 'You must specify a mapping name.', type: 'error'});
      throw Error('You must specify a mapping name.');
    }
  }

  if(this.mapping) {
    this.mapping = this.mapping.toObject();
  } else {
    let mapError = 'Could not find mapping: '+options.mapping.name;
    if(options.mapping.version) {
      mapError += ' with version #' + options.mapping.version;
    }
    this.flow.debug.log({message: mapError, type: 'error'});
    throw Error(mapError);
  }

  //and lastly we get our model definition
  if(!this.entity) {
    let targetArr = this.mapping.targetEntityType.split('/');
    let modelName = targetArr[targetArr.length-1];
    let tVersion = targetArr[targetArr.length-2].split('-');
    let modelVersion = tVersion[tVersion.length-1];
    let entity = fn.head(getModel(modelName, modelVersion));
    if (entity) {
      entity = entity.toObject();
    } else {
      this.flow.debug.log({message: 'Could not find a target entity: '+ this.mapping.targetEntityType, type: 'error'});
      throw Error('Could not find a target entity: '+ this.mapping.targetEntityType);
    }
    this.entity = entity;
  }

  //Now let's get our main model definition
  let mainModel = this.entity.definitions[this.entity.info.title];

  //Then we obtain the document from the source context
  instance = processInstance(mainModel, instance);

  let triples = [];
  let headers = {};

  let envelope = this.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  return envelope;
}

module.exports = {
  main: main
};
