const consts = require('/data-hub/5/impl/consts.sjs');
const defaultLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const lib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const mappingLibrary = require("/data-hub/5/mapping/mapping-lib.sjs");
const entityValidationLib = require('entity-validation-lib.sjs');
const xqueryLib = require('xquery-lib.xqy')
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

// caching mappings in key to object since tests can have multiple mappings run in same transaction
var mappings = {};
let entityModelMap = {};
const traceEvent = consts.TRACE_MAPPING_DEBUG;

function main(contentSequence, options, stepExecutionContext) {
  // The flow framework will pass a sequence, but a number of tests still pass a single object, as this step used to be
  // acceptsBatch=false prior to 5.5.
  contentSequence = hubUtils.normalizeToSequence(contentSequence);

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : consts.DEFAULT_FORMAT;
  if (outputFormat !== consts.JSON && outputFormat !== consts.XML) {
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + consts.XML + ' or ' + consts.JSON + '.');
  }

  let mappingKey = options.mapping ? `${options.mapping.name}:${options.mapping.version}` : null;
  let mapping = mappings[mappingKey];
  if (!mapping && options.mapping && options.mapping.name && options.mapping.version) {
    let version = parseInt(options.mapping.version);
    if(isNaN(version)){
      throw Error('Mapping version ('+options.mapping.version+') is invalid.');
    }
    mapping = defaultLib.getMappingWithVersion(options.mapping.name, version);
    mappings[mappingKey] = mapping;
  } else if (!mapping && options.mapping && options.mapping.name) {
    mapping = defaultLib.getMapping(options.mapping.name);
    mappings[mappingKey] = mapping;
  } else if (!mapping) {
    throw Error('You must specify a mapping name.');
  }

  if(fn.empty(mapping)) {
    let mapError = 'Could not find mapping: ' + options.mapping.name;
    if (options.mapping.version) {
      mapError += ' with version #' + options.mapping.version;
    }
    throw Error(mapError);
  }
  let mappingURIforXML = fn.replace(xdmp.nodeUri(mapping), 'json$','xml');
  let targetEntityType = fn.string(mapping.root.targetEntityType);
  if (targetEntityType === '') {
    let errMsg = `Could not find targetEntityType in mapping: ${xdmp.nodeUri(mapping)}.`;
    throw Error(errMsg);
  }
  let targetEntityName = lib.getEntityName(targetEntityType);

  const mappingStep = fn.head(mapping).toObject();
  buildEntityModelMap(mappingStep);

  const userMappingParameterMap = getUserMappingParameterMap(stepExecutionContext, contentSequence);

  let outputContentArray = [];
  let currentContentUri;

  for (const content of contentSequence) {
    currentContentUri = content.uri;
    try {
      if (xdmp.traceEnabled(consts.TRACE_FLOW_DEBUG)) {
        hubUtils.hubTrace(consts.TRACE_FLOW_DEBUG, `Mapping: ${currentContentUri}`);
      }

      let doc = content.value;
      let instance = lib.extractInstance(doc);

      const mappingParams = Object.assign({}, {"URI":currentContentUri}, userMappingParameterMap);

      // For not-yet-known reasons, catching this error and then simply rethrowing it causes the MappingTest JUnit class
      // to pass due to the "message" part of the JSON in the stepOutput containing the expected output when this is done.
      let arrayOfInstanceArrays;
      try {
        arrayOfInstanceArrays = xqueryLib.dataHubMapToCanonical(instance, mappingURIforXML, mappingParams, {"format":outputFormat});
      } catch (e) {
        const errorMessage = mappingLibrary.extractFriendlyErrorMessage(e);
        if(errorMessage){
          throw Error(errorMessage);
        }
        else{
          throw Error(e);
        }
      }
      hubUtils.hubTrace(traceEvent, `Entity instances with mapping ${mappingStep.name} and source document ${currentContentUri}: ${arrayOfInstanceArrays}`);

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
          entityContext = createContextForRelatedEntityInstance(currentRelatedMapping, content);
        }
        const entityModel = entityModelMap[entityName];

        for(const entityInstance of xdmp.arrayValues(instanceArray)){
          let entityContent = {};
          if(entityName == targetEntityName){
            entityContent = Object.assign(entityContent, content);
          }
          entityContent["value"] = entityInstance.value;
          entityContent["uri"] = buildUri(entityInstance, entityName, outputFormat);
          const entityInstanceContext = Object.assign({}, entityContext);
          entityContent = validateEntityInstanceAndBuildEnvelope(doc, entityContent, entityInstanceContext, entityModel, outputFormat, options);
          hubUtils.hubTrace(traceEvent, `Entity instance envelope created with mapping ${mappingStep.name} and source document ${currentContentUri}: ${entityContent.value}`);
          contentResponse.push(entityContent);
        }
        counter++;
      }

      outputContentArray = outputContentArray.concat(contentResponse);
    } catch (error) {
      // This should always be defined, but some DHF unit tests do not pass it in
      if (stepExecutionContext != null) {
        if (stepExecutionContext.isStopOnError()) {
          stepExecutionContext.stopWithError(error, currentContentUri);
          return [];
        }
        stepExecutionContext.addStepErrorForItem(error, currentContentUri);
      } else {
        throw error;
      }
    }
  }

  // A number of DHF tests expect a single object returned, while the flow framework is fine with one or an array.
  return outputContentArray.length == 1 ? outputContentArray[0] : outputContentArray;
}

function buildUri(entityInstance, entityName, outputFormat){
  if (String(entityInstance.uri)){
    return flowUtils.properExtensionURI(String(entityInstance.uri), outputFormat);
  }
  else{
    httpUtils.throwBadRequest(`Unable to write mapped instance for entity model '${entityName}'; cause: The URI xpath expression for the mapping evaluates to null`);
  }
}

function getUserMappingParameterMap(stepExecutionContext, contentSequence) {
  if (stepExecutionContext != null) {
    const path = stepExecutionContext.flowStep.options.mappingParametersModulePath;
    return path ? require(path)["getParameterValues"](contentSequence) : {};
  }
  return {};
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

function createContextForRelatedEntityInstance(relatedEntityMapping, content){
  let entityContext = {};
  let relatedEntityPermissions = fn.string(relatedEntityMapping.permissions);
  let relatedEntityCollections = relatedEntityMapping.collections;
  if(relatedEntityMapping.additionalCollections){
    relatedEntityCollections = relatedEntityCollections.concat(relatedEntityMapping.additionalCollections);
  }
  entityContext["permissions"] = hubUtils.parsePermissions(relatedEntityPermissions);
  entityContext["collections"] = relatedEntityCollections;
  if(content.context && content.context.originalCollections){
    entityContext.originalCollections = content.context.originalCollections;
  }
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
        attachments: options.attachSourceDocument ? attachments : undefined
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
    if (attachments && options.attachSourceDocument) {
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
    }
    nb.endElement();
  }
  nb.endDocument();
  return nb.toNode();
}

module.exports = {
  buildEnvelope,
  main
};
