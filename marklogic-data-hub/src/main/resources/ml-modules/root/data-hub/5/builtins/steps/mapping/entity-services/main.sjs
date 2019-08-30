const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const defaultLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const lib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const es = require('/MarkLogic/entity-services/entity-services');

// caching mappings in key to object since tests can have multiple mappings run in same transaction
var mappings = {};
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
  let entityName = lib.getEntityName(targetEntityType);
  let entity = lib.getTargetEntity(targetEntityType);
  let instance = doc.xpath('head((/*:envelope/(*:instance[count(* except *:info) gt 1]|*:instance/(* except *:info)),./object-node(),./*))');
  let provenance = {};
  //Then we obtain the newInstance and process it from the source context
  let newInstance;
  try {
    newInstance = es.mapToCanonical(instance, mappingURIforXML, {'format':outputFormat});
  } catch (e) {
    datahub.debug.log({message: e, type: 'error'});
    throw Error(e);
  }

  content.value = buildEnvelope(entity.info, doc, newInstance, outputFormat, options);
  content.provenance = { [content.uri]: provenance };
  return content;
}

// Extracted for unit testing purposes
function buildEnvelope(entityInfo, doc, instance, outputFormat, options) {
  let triples = [];
  let headers = datahub.flow.flowUtils.createHeaders(options);

  if (options.triples && Array.isArray(options.triples)) {
    for (let triple of options.triples) {
      triples.push(xdmp.toJSON(sem.rdfParse(JSON.stringify(triple), "rdfjson")));
    }
  }

  let docHeaders = datahub.flow.flowUtils.getHeaders(doc);
  let docTriples = datahub.flow.flowUtils.getTriples(doc);

  if(docHeaders) {
    docHeaders = docHeaders.toObject();
  } else {
    docHeaders = {};
  }
  if(docTriples){
    docTriples = docTriples.toObject();
  } else {
    docTriples = [];
  }
  headers = Object.assign({}, headers, docHeaders);
  triples = triples.concat(docTriples);
  let attachments = datahub.flow.flowUtils.cleanData(doc, "content", outputFormat);
  headers = datahub.flow.flowUtils.cleanData(headers, "headers", outputFormat);
  triples = datahub.flow.flowUtils.cleanData(triples, "triples", outputFormat);
  let nb = new NodeBuilder().startDocument();
  if (outputFormat === datahub.flow.flowUtils.consts.JSON) {
    if ((!doc instanceof Element && !doc instanceof XMLDocument) && (doc instanceof Object || doc instanceof ObjectNode)) {
      attachments = datahub.flow.flowUtils.jsonToXml(attachments);
    }
    nb.addNode({
      envelope: {
        headers: headers,
        triples: triples,
        instance: Object.assign({
            info: entityInfo
          }, instance.toObject()),
        attachments: attachments
      }
    });
  } else {
    nb.startElement("envelope", "http://marklogic.com/entity-services");
    nb.startElement("headers", "http://marklogic.com/entity-services");
    if (headers && headers instanceof Sequence) {
      for (let header of headers) {
        nb.addNode(header);
      }
    } else if (headers) {
      nb.addNode(headers);
    }
    nb.endElement();

    nb.startElement("triples", "http://marklogic.com/entity-services");
    if (triples && triples instanceof Sequence) {
      for (let triple of triples) {
        if (triple instanceof sem.triple) {
          nb.addNode(datahub.flow.flowUtils.tripleToXml(triple));
        } else {
          nb.addNode(triple);
        }
      }
    } else if (triples) {
      if (triples instanceof sem.triple) {
        nb.addNode(datahub.flow.flowUtils.tripleToXml(triples));
      } else {
        nb.addNode(triples);
      }
    }
    nb.endElement();
    if(instance.nodeName === 'instance') {
      nb.addNode(instance);
    } else {
      nb.startElement("instance", "http://marklogic.com/entity-services");
      nb.startElement("info", "http://marklogic.com/entity-services");
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
        nb.addNode(attachments);
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
