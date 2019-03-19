const DataHub = require("/data-hub/5/datahub.sjs");
var datahub = new DataHub();
var lib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');

function main(content, options) {
  if(!datahub){
    datahub = new DataHub();
  }
  let id = content.uri;
  //let's set our output format, so we know what we're exporting
  let inputFormat = options.inputFormat ? options.inputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    datahub.debug.log({
      message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.',
      type: 'error'
    });
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.');
  }

  //let's see if our doc is in the cluster at update time
  if (!fn.docAvailable(id)) {
    datahub.debug.log({message: 'The document with the uri: ' + id + ' could not be found.', type: 'error'});
    throw Error('The document with the uri: ' + id + ' could not be found.')
  }

  //grab the doc
  // let doc = cts.doc(id);
  let doc = content.value;

  // for json we need to return the instance
  if (doc && doc instanceof Document) {
    doc = fn.head(doc.root);
  }

  //let's prep the instance of the document
  let instance = lib.getInstance(doc);

  //then we grab our mapping
  let mapping = null;
  if (options.mapping && options.mapping.name && options.mapping.version) {
    mapping = lib.getMappingWithVersion(options.mapping.name, options.mapping.version);
  } else if (options.mapping && options.mapping.name) {
    mapping = lib.getMapping(options.mapping.name);
  } else {
    datahub.debug.log({message: 'You must specify a mapping name.', type: 'error'});
    throw Error('You must specify a mapping name.');
  }

  if (mapping) {
    mapping = mapping.toObject();
  } else {
    let mapError = 'Could not find mapping: ' + options.mapping.name;
    if (options.mapping.version) {
      mapError += ' with version #' + options.mapping.version;
    }
    datahub.debug.log({message: mapError, type: 'error'});
    throw Error(mapError);
  }

  //and lastly we get our model definition
  let targetArr = mapping.targetEntityType.split('/');
  let entityName = targetArr[targetArr.length - 1];
  let tVersion = targetArr[targetArr.length - 2].split('-');
  let modelVersion = tVersion[tVersion.length - 1];
  let entityModel = fn.head(lib.getModel(entityName, modelVersion));
  if (entityModel) {
    entityModel = entityModel.toObject();
  } else {
    datahub.debug.log({message: 'Could not find a target entity: ' + mapping.targetEntityType, type: 'error'});
    throw Error('Could not find a target entity: ' + mapping.targetEntityType);
  }

  //Then we obtain the document from the source context
  instance = lib.processInstance(entityModel, mapping, instance);

  let triples = [];
  let headers = datahub.flow.flowUtils.createHeaders(options);

  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);
  content.value = envelope;

  return content;
}

module.exports = {
  main: main
};
