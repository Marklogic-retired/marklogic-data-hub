const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const lib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
var mapping = null;
var entityModel = null;

function main(content, options) {
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
  //if (!fn.docAvailable(id)) {
  //  datahub.debug.log({message: 'The document with the uri: ' + id + ' could not be found.', type: 'error'});
  //  throw Error('The document with the uri: ' + id + ' could not be found.')
  //}

  //grab the doc
  // let doc = cts.doc(id);
  let doc = content.value;

  //then we grab our mapping
  if (!mapping && options.mapping && options.mapping.name && options.mapping.version) {
    let version = parseInt(options.mapping.version);
    if(isNaN(version)){
      datahub.debug.log({message: 'Mapping version ('+options.mapping.version+') is invalid.', type: 'error'});
      throw Error('Mapping version ('+options.mapping.version+') is invalid.');
    }
    mapping = lib.getMappingWithVersion(options.mapping.name, version);
  } else if (!mapping && options.mapping && options.mapping.name) {
    mapping = lib.getMapping(options.mapping.name);
  } else if (!mapping) {
    datahub.debug.log({message: 'You must specify a mapping name.', type: 'error'});
    throw Error('You must specify a mapping name.');
  }

  if (mapping && (mapping.constructor.name === "Document" || mapping.constructor.name === "ObjectNode")) {
    mapping = mapping.toObject();
  }
  if(!mapping) {
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
  if(!entityModel) {
    entityModel = fn.head(lib.getModel(entityName, modelVersion));
  }
  if (entityModel && (entityModel.constructor.name === "Document" || entityModel.constructor.name === "ObjectNode")) {
    entityModel = entityModel.toObject();
  }
  if(!entityModel) {
    datahub.debug.log({message: 'Could not find a target entity: ' + mapping.targetEntityType, type: 'error'});
    throw Error('Could not find a target entity: ' + mapping.targetEntityType);
  }
  if(!entityModel.info) {
    datahub.debug.log({message: 'Could not find the model info on the target entity: ' + mapping.targetEntityType, type: 'error'});
    throw Error('Could not find the model info on the target entity: ' + mapping.targetEntityType);
  }
  if(!entityModel.info.title) {
    datahub.debug.log({message: 'Could not find the model title on the target entity: ' + mapping.targetEntityType, type: 'error'});
    throw Error('Could not find the model title on the target entity: ' + mapping.targetEntityType);
  }

  let instance;
  //Then we obtain the instance and process it from the source context
  try {
    instance = lib.processInstance(entityModel, mapping, doc);
  } catch (e) {
    datahub.debug.log({message: e, type: 'error'});
    throw Error(e);
  }

  //now let's make our attachments, if it's xml, it'll be passed as string
  instance['$attachments'] = doc;

  let triples = [];
  let headers = datahub.flow.flowUtils.createHeaders(options);

  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
    }
  }
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);
  content.value = envelope;

  return content;
}

module.exports = {
  main: main
};
