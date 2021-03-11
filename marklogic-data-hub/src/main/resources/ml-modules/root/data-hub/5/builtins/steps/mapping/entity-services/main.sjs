const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const consts = require('/data-hub/5/impl/consts.sjs');
const defaultLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const lib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const entityValidationLib = require('entity-validation-lib.sjs');
const xqueryLib = require('xquery-lib.xqy')
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

// caching mappings in key to object since tests can have multiple mappings run in same transaction
var mappings = {};
let entityModelMap = {};
const traceEvent = consts.TRACE_MAPPING_DEBUG;

function main(content, options) {
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : consts.DEFAULT_FORMAT;
  if (outputFormat !== consts.JSON && outputFormat !== consts.XML) {
    datahub.debug.log({
      message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + consts.XML + ' or ' + consts.JSON + '.',
      type: 'error'
    });
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + consts.XML + ' or ' + consts.JSON + '.');
  }

  let doc = content.value;

  //then we grab our mapping
  let mappingKey = options.mapping ? `${options.mapping.name}:${options.mapping.version}` : null;
  let mapping = mappings[mappingKey];
  if (!mapping && options.mapping && options.mapping.name && options.mapping.version) {
    let version = parseInt(options.mapping.version);
    if(isNaN(version)){
      datahub.debug.log({message: 'Mapping version ('+options.mapping.version+') is invalid.', type: 'error'});
      throw Error('Mapping version ('+options.mapping.version+') is invalid.');
    }
    mapping = defaultLib.getMappingWithVersion(options.mapping.name, version);
    mappings[mappingKey] = mapping;
  } else if (!mapping && options.mapping && options.mapping.name) {
    mapping = defaultLib.getMapping(options.mapping.name);
    mappings[mappingKey] = mapping;
  } else if (!mapping) {
    datahub.debug.log({message: 'You must specify a mapping name.', type: 'error'});
    throw Error('You must specify a mapping name.');
  }

  if(fn.empty(mapping)) {
    let mapError = 'Could not find mapping: ' + options.mapping.name;
    if (options.mapping.version) {
      mapError += ' with version #' + options.mapping.version;
    }
    datahub.debug.log({message: mapError, type: 'error'});
    throw Error(mapError);
  }
  let mappingURIforXML = fn.replace(xdmp.nodeUri(mapping), 'json$','xml');
  let targetEntityType = fn.string(mapping.root.targetEntityType);
  if (targetEntityType === '') {
    let errMsg = `Could not find targetEntityType in mapping: ${xdmp.nodeUri(mapping)}.`;
    datahub.debug.log({message: errMsg, type: 'error'});
    throw Error(errMsg);
  }
  let targetEntityName = lib.getEntityName(targetEntityType);

  let instance = lib.extractInstance(doc);

  const userParams = {"URI":content.uri};

  let arrayOfInstanceArrays;
  try {
    arrayOfInstanceArrays = xqueryLib.dataHubMapToCanonical(instance, mappingURIforXML, userParams, {"format":outputFormat});
  } catch (e) {
    datahub.debug.log({message: e, type: 'error'});
    throw Error(e);
  }

  const mappingStep = fn.head(mapping).toObject();
  hubUtils.hubTrace(traceEvent, `Entity instances with mapping ${mappingStep.name} and source document ${content.uri}: ${arrayOfInstanceArrays}`);

  buildEntityModelMap(mappingStep);

  let counter = 0;
  let contentResponse = [];

  for(const instanceArray of xdmp.arrayValues(arrayOfInstanceArrays)){
    /* The first instance in the array is the target entity instance. 'permissions' and 'collections' for target instance
    are applied outside of main.sjs */
    let entityName ;
    let entityContext = {};

    if(counter == 0){
      entityName = targetEntityName;
      entityContext = content.context;
    }
    else {
      let currentRelatedMapping = mappingStep.relatedEntityMappings[counter-1];
      entityName = lib.getEntityName(fn.string(currentRelatedMapping.targetEntityType));
      entityContext = createContextForRelatedEntityInstance(currentRelatedMapping);
    }
    const entityModel = entityModelMap[entityName];

    for(const entityInstance of xdmp.arrayValues(instanceArray)){
      let entityContent = {};
      if(entityName == targetEntityName){
        entityContent = Object.assign(entityContent, content);
        entityContent["uri"] = flowUtils.properExtensionURI(content.uri, outputFormat);
      }
      else{
        entityContent["uri"] = flowUtils.properExtensionURI("/"+entityName + "/" + sem.uuidString() + ".json", outputFormat)
      }
      entityContent["value"] = entityInstance;
      entityContent = validateEntityInstanceAndBuildEnvelope(doc, entityContent, entityContext, entityModel, outputFormat, options);
      hubUtils.hubTrace(traceEvent, `Entity instance envelope created with mapping ${mappingStep.name} and source document ${content.uri}: ${entityContent.value}`);
      contentResponse.push(entityContent);
    }
    counter++;
  }
  return contentResponse.length == 1 ? contentResponse[0] : contentResponse;
}

function validateEntityInstanceAndBuildEnvelope(doc, entityContent, entityContext, entityModel, outputFormat, options){
  // Must validate before building an envelope so that validaton errors can be added to the headers
  entityValidationLib.validateEntity(entityContent.value, options, entityModel.info);

  entityContent["value"] = buildEnvelope(entityModel.info, doc, entityContent.value, outputFormat, options);

  // Must remove these so that they're not carried over to another item in a batch
  entityValidationLib.removeValidationErrorsFromHeaders(options);
  entityContent["context"] = entityContext;
  return entityContent;
}

function createContextForRelatedEntityInstance(relatedEntityMapping){
  let entityContext = {};
  let relatedEntityPermissions = fn.string(relatedEntityMapping.permissions);
  let relatedEntityCollections = relatedEntityMapping.collections;
  entityContext["permissions"] = hubUtils.parsePermissions(relatedEntityPermissions);
  entityContext["collections"] = relatedEntityCollections;
  entityContext["useContextCollectionsOnly"] = true;
  return entityContext;

}

function buildEntityModelMap(mappingStep){
  let targetEntityName = lib.getEntityName(mappingStep.targetEntityType);
  let targetEntityModel= lib.getTargetEntity(mappingStep.targetEntityType);
  entityModelMap[targetEntityName] = targetEntityModel;
  if(mappingStep.relatedEntityMappings){
    mappingStep.relatedEntityMappings.forEach(relatedEntityMapping => {
      let relatedEntityName = lib.getEntityName(relatedEntityMapping.targetEntityType);
      if(!entityModelMap[relatedEntityName]){
        let relatedEntityModel= lib.getTargetEntity(relatedEntityMapping.targetEntityType);
        entityModelMap[relatedEntityName] = relatedEntityModel;
      }
    });
  }
}

// Extracted for unit testing purposes
function buildEnvelope(entityInfo, doc, instance, outputFormat, options) {
  let triples = [];
  let headers = flowUtils.createHeaders(options);

  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(sem.triple(triple));
    }
  }

  let docHeaders = flowUtils.normalizeValuesInNode(flowUtils.getHeaders(doc)) || {};
  let docTriples = flowUtils.normalizeValuesInNode(flowUtils.getTriples(doc)) || [];


  headers = flowUtils.mergeHeaders(headers, docHeaders, outputFormat);
  headers = flowUtils.updateHeaders(headers, outputFormat);
  triples = triples.concat(hubUtils.normalizeToArray(docTriples));
  let attachments = flowUtils.cleanData(doc, "content", outputFormat);
  let nb = new NodeBuilder().startDocument();
  if (outputFormat === consts.JSON) {
    if ((!doc instanceof Element && !doc instanceof XMLDocument) && (doc instanceof Object || doc instanceof ObjectNode)) {
      attachments = flowUtils.jsonToXml(attachments);
    }
    nb.addNode({
      envelope: {
        headers: headers,
        triples: triples.map((triple) => flowUtils.normalizeTriple(triple).toObject()),
        instance: Object.assign({
          info: entityInfo
        }, instance.toObject()),
        attachments: attachments
      }
    });
  } else {
    nb.startElement("envelope", "http://marklogic.com/entity-services");
    nb.startElement("headers", "http://marklogic.com/entity-services");
    if (flowUtils.isNonStringIterable(headers)) {
      for (let header of headers) {
        nb.addNode(header);
      }
    } else if (headers) {
      nb.addNode(headers);
    }
    nb.endElement();

    nb.startElement("triples", "http://marklogic.com/entity-services");
    if (flowUtils.isNonStringIterable(triples)) {
      for (let triple of triples) {
        nb.addNode(flowUtils.tripleToXml(flowUtils.normalizeTriple(triple)));
      }
    } else if (triples) {
      nb.addNode(flowUtils.tripleToXml(flowUtils.normalizeTriple(triples)));
    }
    nb.endElement();
    if(instance.nodeName === 'instance') {
      nb.addNode(instance);
    } else {
      nb.startElement("instance", "http://marklogic.com/entity-services");
      nb.startElement("info", "http://marklogic.com/entity-services");
      nb.startElement("baseUri", "http://marklogic.com/entity-services");
      nb.addText(entityInfo.baseUri);
      nb.endElement();
      nb.startElement("title", "http://marklogic.com/entity-services");
      nb.addText(entityInfo.title);
      nb.endElement();
      nb.startElement("version", "http://marklogic.com/entity-services");
      nb.addText(entityInfo.version);
      nb.endElement();
      nb.endElement();
      if (instance instanceof Sequence) {
        for (let n of instance) {
          nb.addNode(n);
        }
      } else {
        nb.addNode(instance);
      }
      nb.endElement();
    }
    if (attachments) {
      nb.startElement("attachments", "http://marklogic.com/entity-services");
      if (attachments instanceof Document && attachments.documentFormat === 'JSON') {
        nb.addText(xdmp.quote(attachments));
      } else {
        // can get sequence of nodes in JSON to XML scenario
        if (flowUtils.isNonStringIterable(attachments)) {
          for (let attachment of attachments) {
            nb.addNode(attachment);
          }
        } else if (attachments) {
          nb.addNode(attachments);
        }
      }
      nb.endElement();
    } else {
      nb.startElement("attachments", "http://marklogic.com/entity-services");
      nb.endElement();
    }
    nb.endElement();
  }
  nb.endDocument();
  return nb.toNode();
}

module.exports = {
  main: main,
  buildEnvelope: buildEnvelope
};
