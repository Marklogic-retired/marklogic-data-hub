/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

import consts from "/data-hub/5/impl/consts.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const json = require('/MarkLogic/json/json.xqy');
const sem = require("/MarkLogic/semantics.xqy");
const currentDateTime = fn.currentDateTime();
const currentUser = xdmp.getCurrentUser();
/**
   : Determine the input document type from the root node.
   :
   : @param rootNode -
   : @return - a copy of the xml without the bad elements
   */

function determineDocumentType(input) {
  switch (input.nodeKind) {
  case "object":
    return consts.JSON;
  case "array":
    return consts.JSON;
  case "element":
    return consts.XML;
  case "text":
    return consts.TEXT;
  case "binary":
    return consts.BINARY;
  case "document":
    return determineDocumentType(input.root);
  default:
    return consts.DEFAULT_FORMAT;
  }
}
/**
   : Construct an envelope
   :
   : @param content - A content object that's used to build "instance" section of the envelope
   : @param headers - An object that goes into 'headers' section of envelope
   : @param triples - An array of triples that goes into 'triples' section of envelope
   : @param dataFormat - The format of the envelope. For example, "xml" or "json"
   : @return - The envelope in the specified 'dataFormat'
   */
function makeEnvelope(content, headers, triples, dataFormat) {
  content = cleanData(content, "content", dataFormat);
  headers = cleanData(normalizeValuesInNode(headers), "headers", dataFormat);
  triples = normalizeValuesInNode(triples);
  let instance = null;
  let attachments = null;
  let inputFormat = determineDocumentType(content);
  if (content instanceof Object && content.hasOwnProperty("$type")) {
    if (dataFormat === consts.JSON) {
      instance = instanceToCanonicalJson(content);
      instance.info = {
        title: content['$type'],
        version: content['$version']
      };
      if (hubUtils.isElementNode(content['$attachments'])) {
        attachments =  xmlToJson(content['$attachments']);
      } else {
        attachments = content['$attachments'];
      }
    } else if (dataFormat === consts.XML) {
      instance = instanceToCanonicalXml(content);
      if (content['$attachments'] && (!hubUtils.isNode(content['$attachments']) || hubUtils.isObjectNode(content['$attachments']))) {
        attachments = jsonToXml(content['$attachments']);
      } else {
        attachments = content['$attachments'];
      }
    }
  } else if (inputFormat === dataFormat) {
    if (hubUtils.isElementNode(content) &&  content.nodeName.toLowerCase() === 'dataHubXmlWrapper' && content.namespaceURI.toLowerCase() === "") {
      instance = Sequence.from(content.xpath('node()'));
    } else {
      if (content['$attachments']) {
        attachments = content['$attachments'];
        delete content['$attachments'];
      }
      instance = content;
    }
  } else {
    // cleanData has already changed the content body to the expected output
    instance = content;
  }

  if (dataFormat === consts.JSON) {
    if (isNonStringIterable(triples)) {
      let triplesAsArray = [];
      for (let triple of triples) {
        if (hubUtils.isSequence(triple)) {
          triplesAsArray = triplesAsArray.concat(triple.toArray());
        } else if (Array.isArray(triple)) {
          triplesAsArray = triplesAsArray.concat(triple);
        } else {
          triplesAsArray.push(triple);
        }
      }
      triples = triplesAsArray;
    }
    if (instance && instance.root) {
      instance = instance.root;
    }
    return {
      envelope: {
        headers: headers,
        triples: triples.map((triple) => normalizeTriple(triple)),
        instance: instance,
        attachments: attachments
      }
    };
  } else if (dataFormat === consts.XML) {
    const nb = new NodeBuilder();
    nb.startDocument();
    nb.startElement("envelope", "http://marklogic.com/entity-services");
    nb.startElement("headers", "http://marklogic.com/entity-services");
    if (isNonStringIterable(headers)) {
      for (let header of headers) {
        nb.addNode(header);
      }
    } else if (headers) {
      nb.addNode(headers);
    }
    nb.endElement();

    nb.startElement("triples", "http://marklogic.com/entity-services");
    if (isNonStringIterable(triples)) {
      for (let triple of triples) {
        nb.addNode(tripleToXml(normalizeTriple(triple)));
      }
    } else if (triples) {
      nb.addNode(tripleToXml(normalizeTriple(triples)));
    }
    nb.endElement();
    if (instance.nodeName === 'instance') {
      nb.addNode(instance);
    } else {
      nb.startElement("instance", "http://marklogic.com/entity-services");
      if (isNonStringIterable(instance)) {
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
      if (content instanceof Object && content.hasOwnProperty("$attachments")) {
        let attachments = content["$attachments"];
        if (hubUtils.isXmlNode(attachments)) {
          nb.addNode(attachments);
        } else {
          let xmlAttachments = json.transformFromJson(attachments, json.config('custom'));
          if (hubUtils.isSequence(xmlAttachments)) {
            for (let xmlNode of xmlAttachments) {
              nb.addNode(xmlNode);
            }
          } else {
            nb.addNode(xmlAttachments);
          }
        }
      } else if (hubUtils.isXmlNode(attachments)) {
        nb.addNode(attachments);
      }
      nb.endElement();
    } else {
      nb.startElement("attachments", "http://marklogic.com/entity-services");
      nb.endElement();
    }
    nb.endElement();
    nb.endDocument();
    const results = nb.toNode();
    return results;
  }

  httpUtils.throwBadRequest("Invalid data format: " + dataFormat + ".  Must be JSON or XML");
}

function cleanData(resp, destination, dataFormat) {
  if (hubUtils.isDocumentNode(resp)) {
    if (fn.count(resp.xpath('node()')) > 1) {
      httpUtils.throwBadRequest("Too Many Nodes!. Return just 1 node");
    } else {
      resp = resp.xpath('node()');
    }
  }

  if (hubUtils.isBinaryNode(resp)) {
    return xs.hexBinary(resp);
  }

  if (hubUtils.isSequence(resp)) {
    let cleanResp = [];
    for (const respPart of resp) {
      cleanResp.push(cleanData(respPart, destination, dataFormat));
    }
    return Sequence.from(cleanResp);
  }

  let isXml = hubUtils.isXmlNode(resp);
  if (!isXml && resp) {
    // object with $type key is ES response type
    if (resp instanceof Object && resp.hasOwnProperty('$type')) {
      return resp;
    } else if (dataFormat === consts.XML) {
      const xmlResp = jsonToXml(resp);
      return xmlResp;
    } else {
      return resp;
    }
  } else if (isXml && resp) {
    if (dataFormat === consts.JSON) {
      return xmlToJson(resp);
    } else {
      return resp;
    }
  } else if (!resp) {
    if (destination === "headers" && dataFormat === consts.JSON) {
      return {};
    } else if (destination === "triples" && dataFormat === consts.JSON) {
      return [];
    } else {
      return resp;
    }
  }

  if (dataFormat === consts.JSON &&
      destination === "triples") {
    return json.toArray(resp);
  }

  return resp;
}

function tripleToXml(triple) {
  return sem.rdfSerialize(triple, 'triplexml').xpath('*');
}

function normalizeTriple(triple) {
  if (triple instanceof sem.triple || !triple) {
    return triple;
  } else if (triple[Symbol.iterator]) {
    const triples = [];
    for (const t of triple) {
      triples.push(normalizeTriple(t));
    }
    return triples.length <= 1 ? triples[0]: triples;
  } else if (triple.toObject && !hubUtils.isElementNode(triple)) {
    return normalizeTriple(triple.toObject());
  } else {
    return sem.triple(triple);
  }
}

function instanceToCanonicalJson(entityInstance) {
  let o;
  if (entityInstance['$ref']) {
    o = entityInstance['$ref'];
  } else {
    o = {};
    for (let key in entityInstance) {
      if (key === '$attachments' || key === '$type' || key === '$version') {
      } else {
        let instanceProperty = entityInstance[key];
        if (instanceProperty instanceof Array) {
          let a = [];
          let i = 0;
          for (i = 0; i < instanceProperty.length; i++) {
            let val = instanceProperty[i];
            if (val instanceof Object) {
              a.push(instanceToCanonicalJson(val));
            } else {
              a.push(val);
            }
          }
          o[key] = a;
        } else {
          o[key] = instanceProperty;
        }
      }
    }
  }
  let rootObject = {};
  if (entityInstance['$type'] != undefined) {
    rootObject[entityInstance['$type']] = o;
  } else {
    rootObject = o;
  }
  return rootObject;
}

function getElementName(ns, nsPrefix, name) {
  return ns && nsPrefix ? nsPrefix + ':' + name : name;
}

function getElementNamespace(ns, nsPrefix) {
  return ns && nsPrefix ? ns : null;
}


function instanceToCanonicalXml(entityInstance) {
  let namespace = entityInstance['$namespace'];
  let namespacePrefix = entityInstance['$namespacePrefix'];
  let typeName = entityInstance['$type'];
  let typeQName = getElementName(namespace, namespacePrefix, typeName);
  let ns = getElementNamespace(namespace, namespacePrefix);
  const nb = new NodeBuilder();
  nb.startElement("instance", "http://marklogic.com/entity-services");
  nb.startElement("info", "http://marklogic.com/entity-services");
  nb.startElement("title", "http://marklogic.com/entity-services");
  nb.addText(entityInstance["$type"]);
  nb.endElement();
  nb.startElement("version", "http://marklogic.com/entity-services");
  nb.addText(entityInstance["$version"]);
  nb.endElement();
  nb.endElement();
  nb.startElement(typeQName, ns);
  if (entityInstance['$ref']) {
    nb.addNode(entityInstance['$ref']);
  } else {
    for (let key in entityInstance) {
      if (xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'NCName', key) && key !== '$type') {
        let nsKey = getElementName(namespace, namespacePrefix, key);
        let prop = entityInstance[key];
        let isArray = Array.isArray(prop);
        if (isArray || hubUtils.isSequence(prop)) {
          for (let item of prop) {
            instanceItemToCanonicalXml(nb, item, nsKey, ns, isArray);
          }
        } else {
          instanceItemToCanonicalXml(nb, prop, nsKey, ns, false);
        }
      }
    }
  }
  nb.endElement();
  nb.endElement();
  return nb.toNode();
}

function instanceItemToCanonicalXml(nb, item, nsKey, ns, isArray) {
  if (item instanceof Object && !(item instanceof xs.anyAtomicType)) {
    if (isArray) {
      nb.startElement(nsKey, ns);
      nb.addAttribute('datatype', 'array');
      let canonical = instanceToCanonicalXml(item);
      if (canonical) {
        nb.addNode(canonical);
      }
      nb.endElement();
    } else {
      // TODO the line below doesn't add to the node builder...
      // instanceToCanonicalXml(item);
    }
  } else {
    nb.startElement(nsKey, ns);
    if (isArray) {
      nb.addAttribute('datatype', 'array');
    }

    if (hubUtils.isNode(item)) {
      nb.addNode(item);
    } else if (item instanceof Number) {
      nb.addNumber(item);
    } else if (item instanceof Boolean) {
      nb.addBoolean(item);
    } else if (item !== null) {
      nb.addText(item.toString());
    }
    nb.endElement();
  }
}

function xmlToJson(content) {
  let rootElementName = content.localName;
  let contentBody = xmlNodeToJson(content);
  return {
    [rootElementName]: contentBody
  };
}

function xmlNodeToJson(content) {
  if (content && (content.hasChildNodes() || (content.attributes && content.attributes.length))) {
    let organizedOutput = {};
    let attributes = content.attributes;
    for (let i = 0; i < attributes.length; i++) {
      let childNode = attributes[i];
      organizedOutput[`@${childNode.localName}`] = organizedOutput[childNode.localName] || [];
      organizedOutput[`@${childNode.localName}`].push(xmlNodeToJson(childNode));
    }
    let childNodes = content.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let childNode = childNodes[i];
      if (hubUtils.isElementNode(childNode)) {
        organizedOutput[childNode.localName] = organizedOutput[childNode.localName] || [];
        organizedOutput[childNode.localName].push(xmlNodeToJson(childNode));
      } else {
        organizedOutput['$text'] = organizedOutput['$text'] || [];
        organizedOutput['$text'].push(xmlNodeToJson(childNode));
      }
    }
    if (organizedOutput['$text'] && fn.normalizeSpace(organizedOutput['$text'].join('')) === '') {
      delete organizedOutput['$text'];
    }
    for (let key in organizedOutput) {
      if (organizedOutput.hasOwnProperty(key) && organizedOutput[key].length === 1) {
        organizedOutput[key] = organizedOutput[key][0];
      }
    }
    if (Object.keys(organizedOutput).length === 1 && organizedOutput['$text']) {
      return organizedOutput['$text'];
    } else {
      return organizedOutput;
    }
  } else if (fn.nilled(content)) {
    return null;
  } else {
    return fn.string(content);
  }
}

function jsonToXml(content) {
  let contentInput = content;
  if (hubUtils.isJsonNode(content)) {
    contentInput = content.toObject();
  }
  if (hubUtils.isSequence(contentInput)) {
    contentInput = contentInput.toArray();
  }
  let nb = new NodeBuilder().startElement('dataHubXmlWrapper');
  return  jsonToXmlNodeBuilder(contentInput, nb).endElement().toNode().xpath('node()');
}

function jsonToXmlNodeBuilder(content, nb = new NodeBuilder()) {
  if (isNonStringIterable(content)) {
    for (const subContent of content) {
      jsonToXmlNodeBuilder(subContent, nb);
    }
  } else if (content instanceof xs.anyAtomicType) {
    nb.addText(fn.string(content));
  } else if (typeof content === "object") {
    for (const propName in content) {
      if (content.hasOwnProperty(propName)) {
        const propValues = content[propName];
        const elementName = (!xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "QName", propName)) ? xdmp.encodeForNCName(propName) : propName;
        if (Array.isArray(propValues)) {
          for (let propValueIndex in propValues) {
            if (propValues.hasOwnProperty(propValueIndex)) {
              nb.startElement(elementName);
              jsonToXmlNodeBuilder(propValues[propValueIndex], nb);
              nb.endElement();
            }
          }
        } else {
          nb.startElement(elementName);
          jsonToXmlNodeBuilder(propValues, nb);
          nb.endElement();
        }
      }
    }
  } else if (hubUtils.isNode(content)) {
    nb.addNode(content);
  } else {
    nb.addText(fn.string(content));
  }
  return nb;
}

function evalSubstituteVal(value) {
  let obj = consts.PROPERTY_KEY_MAP.get(value);
  if (obj === undefined) return value;
  if (obj == consts.CURRENT_DATE_TIME) {
    return currentDateTime;
  } else if (obj == consts.CURRENT_USER) {
    return currentUser;
  }
  return value;
}

function createHeaders(options) {
  let headers = {};
  for (let key in options.headers) {
    headers[key] = evalSubstituteVal(options.headers[key]);
  }
  if (options.file) {
    headers["createdUsingFile"] = options.file;
  }

  const sourceName = options.sourceName ? options.sourceName : null;
  const sourceType = options.sourceType ? options.sourceType : null;

  if (headers["sources"] && !Array.isArray(headers["sources"])) {
    headers.sources = [headers.sources];
  }

  if (sourceName || sourceType) {
    if (!headers["sources"] || headers["sources"].length == 0) {
      headers["sources"] = [];
    }
    headers["sources"].push({
      "datahubSourceName": sourceName === null ? undefined : sourceName,
      "datahubSourceType": sourceType === null ? undefined : sourceType
    });
  }
  return headers;
}

function mergeHeaders(headers, docHeaders, outputFormat) {
  if (outputFormat === consts.XML) {
    headers = cleanData(Sequence.from([
      docHeaders,
      jsonToXml(headers)
    ]), "headers", outputFormat);
  } else {
    let docHeadersArray = [];
    if (isNonStringIterable(docHeaders)) {
      for (let header of docHeaders) {
        if (hubUtils.isElementNode(header)) {
          docHeadersArray.push(xmlToJson(header));
        } else {
          docHeadersArray.push(header);
        }
      }
    } else {
      if (hubUtils.isElementNode(docHeaders)) {
        docHeadersArray.push(xmlToJson(docHeaders));
      } else {
        docHeadersArray.push(docHeaders);
      }
    }
    docHeaders = docHeadersArray.reduce((acc, cur) => Object.assign(acc, cur), {});
    headers = Object.assign({}, headers, docHeaders);
  }
  return headers;
}

//If the document header has 'createdBy' or 'createdOn' properties, this method updates it with current values.
function updateHeaders(headers, outputFormat) {
  const currentUser = xdmp.getCurrentUser();
  const currentDateTime = fn.currentDateTime();
  if (outputFormat === consts.XML) {
    let response = [];
    for (const headerElement of headers) {
      if (fn.localName(headerElement) == "createdBy") {
        response.push(normalizeValuesInNode(xdmp.unquote(`<createdBy xmlns="">${currentUser}</createdBy>`)));
      } else if (fn.localName(headerElement) == "createdOn") {
        response.push(normalizeValuesInNode(xdmp.unquote(`<createdOn xmlns="">${currentDateTime}</createdOn>`)));
      } else {
        response.push(headerElement);
      }
    }
    return Sequence.from(response);
  } else {
    if (headers.createdBy) {
      headers["createdBy"] = currentUser;
    }
    if (headers.createdOn) {
      headers["createdOn"] = currentDateTime;
    }
    return headers;
  }
}

function createMetadata(metaData = {}, flowName, stepName, jobId) {
  if (!metaData) {
    metaData = {};
  }
  metaData[consts.CREATED_ON] = fn.string(evalSubstituteVal(consts.CREATED_ON));
  metaData[consts.CREATED_BY] = fn.string(evalSubstituteVal(consts.CREATED_BY));
  metaData[consts.CREATED_IN_FLOW] = flowName;
  metaData[consts.CREATED_BY_STEP] = stepName;
  metaData[consts.RAN_BY_STEPS] = fn.stringJoin(fn.distinctValues(Sequence.from([fn.tokenize(metaData[consts.RAN_BY_STEPS], "\\s+"), stepName])), " ");
  metaData[consts.CREATED_BY_JOB] = fn.stringJoin(fn.distinctValues(Sequence.from([fn.tokenize(metaData[consts.CREATED_BY_JOB], "\\s+"), jobId])), " ");
  return metaData;
}

function getInstanceAsObject(doc) {
  let instance = getInstance(doc);
  if (instance) {
    instance = instance.toObject();
  }
  return instance;
}

function getInstance(doc) {
  let instance = fn.head(doc.xpath('/*:envelope/*:instance'));
  if (fn.count(instance) === 0) {
    instance = null;
  }
  return instance;
}

function getHeadersAsObject(doc) {
  let headers = getHeaders(doc);
  if (headers) {
    headers = headers.toObject();
  }
  return headers;
}

function getHeaders(doc) {
  let headers = fn.head(doc.xpath('/*:envelope/*:headers'));
  if (fn.count(headers) === 0) {
    headers = null;
  } else if (fn.count(fn.head(doc.xpath('/*:envelope/*:headers/*'))) === 0) {
    headers = null;
  }
  return headers;
}

function normalizeValuesInNode(node) {
  if (hubUtils.isElementNode(node)) {
    return node.xpath('*');
  }
  return node;
}

function getTriplesAsObject(doc) {
  let triples = getTriples(doc);
  if (triples) {
    triples = triples.toObject();
  }
  return triples;
}

function getTriples(doc) {
  let triples = fn.head(doc.xpath('/*:envelope/(*:triples[self::element()]|array-node("triples"))'));
  if (fn.count(triples) === 0) {
    triples = null;
  } else if (fn.count(fn.head(doc.xpath('/*:envelope/*:triples/*'))) === 0) {
    triples = null;
  }
  return triples;
}

function createContentAsObject() {
  return {
    triples: [],
    headers: {},
    instance: {}
  };
}

// This function was used in the scaffolded custom-ingestion from DHF 5.0 to 5.4 and thus
// must be retained in the 5.x timeframe
function parseText(text, outputFormat) {
  let options = outputFormat == consts.XML ? "format-xml" : "format-json";
  return fn.head(xdmp.unquote(text, null, options));
}

function isNonStringIterable(obj) {
  if (!obj || typeof obj === 'string') {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function properExtensionURI(uri, outputFormat) {
  // fix the document URI if the format changes
  if (uri && !uri.endsWith(outputFormat.toLowerCase())) {
    uri = `${uri.replace(/\.(json|xml)$/gi, '')}.${outputFormat}`;
  }
  return uri;
}

/**
 * @param content
 * @param flowName
 * @param stepName
 * @param jobId
 */
function addMetadataToContent(content, flowName, stepName, jobId) {
  content.context = content.context || {};
  content.context.metadata = createMetadata(content.context.metadata || {}, flowName, stepName, jobId);
  if (content.context.collections) {
    content.context.collections = hubUtils.normalizeToArray(content.context.collections);
  }

  if (content.context.permissions) {
    content.context.permissions = hubUtils.normalizeToArray(content.context.permissions).map(perm => {
      if (hubUtils.isElementNode(perm)) {
        const roleName = xdmp.roleName(fn.string(perm.xpath("*:role-id")));
        const capability = fn.string(perm.xpath("*:capability"));
        return xdmp.permission(roleName, capability);
      }
      return perm;
    });
  }
}

/**
 * @param contentArray the array of content objects to write
 * @param databaseName the database to write the content objects to
 * @return An object consisting of properties "databaseName", "transactionId", and "transactionDateTime"
 */
function writeContentArray(contentArray, databaseName, provenanceQueue) {
  const legFlowLibXqy = require("/data-hub/4/impl/flow-lib.xqy");
  const writerQueueXqy = legFlowLibXqy.writerQueue;
  const legFlowLib = require("/data-hub/4/impl/flow-lib.sjs");
  const writerQueue = legFlowLib.writerQueue;
  const vars = {contentArray, provenanceQueue, writerQueue, writerQueueXqy};

  // ignoreAmps is true to prevent a user from e.g. overwriting job documents, which could be done via an amp
  const options = {
    update: 'true',
    ignoreAmps: true
  };
  if (databaseName) {
    options.database = xdmp.database(databaseName);
  }
  try {
    return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-queue-write.mjs', vars, options));
  } catch (e) {
    handleWriteErrors(e, contentArray);
  }
}

function handleWriteErrors(error, contentArray) {
  xdmp.log(xdmp.toJsonString(error));
  switch (error.name) {
  case 'XDMP-CONFLICTINGUPDATES':
    let data = error.data[0];
    let parseUriRegex = /^xdmp\.documentInsert\("([^"]+)".*$/;
    let uri = parseUriRegex.test(data) ? data.replace(parseUriRegex, '$1'): null;
    httpUtils.throwBadRequest(`Attempted to write to the same URI multiple times in the same transaction. ${ uri ? 'URI: ' + uri : ''}`);
  case 'TDE-INDEX':
    let isFailOnSubjectIRI = error.data.includes('$subject-iri') || error.data.includes("$primary-key-val");
    if (isFailOnSubjectIRI) {
      let failedContentObject = contentArray.find((contentObj) => error.data.includes(contentObj.uri));
      if (failedContentObject) {
        let contentValue = failedContentObject.value;
        let entityTitle;
        if (hubUtils.isNode(contentValue)) {
          entityTitle = fn.string(contentValue.xpath('/*:envelope/*:instance/*:info/*:title'));
        } else {
          entityTitle = contentValue.envelope.instance.info.title;
        }
        httpUtils.throwBadRequest(`Cannot write ${entityTitle} instance with multiple values for identifier property. URI: ${failedContentObject.uri}`);
      }
    }
  default:
    throw error;
  }
}

/**
 *
 * @param theFlow
 * @param stepDefinition
 * @param stepNumber
 * @param runtimeOptions
 * @returns the "combined" options based on the order of precedence of option sources.
 * If stepOptions is present in runtimeOptions, and stepOptions has a key matching that of the
 * stepNumber, then the value of that key will also be applied to the combined options. Note that
 * the combined options will also have "stepOptions" present in it if that exists in the runtime
 * options.
 */
function makeCombinedOptions(theFlow, stepDefinition, stepNumber, runtimeOptions) {
  theFlow = theFlow || {};
  const flowSteps = theFlow.steps || {};
  stepDefinition = stepDefinition || {};
  runtimeOptions = runtimeOptions || {};

  const stepRuntimeOptions = runtimeOptions.stepOptions ? runtimeOptions.stepOptions[stepNumber] : {};
  const stepOptions = flowSteps[stepNumber] ? flowSteps[stepNumber].options : {};

  return Object.assign({},
    stepDefinition.options,
    theFlow.options,
    stepOptions,
    runtimeOptions,
    stepRuntimeOptions
  );
}

function buildInvokeOptionsForCustomHook(user, database) {
  // ignoreAmps is true to prevent a user from e.g. overwriting job documents, which could be done via an amp
  const options = {
    ignoreAmps: true
  };
  if (user && user !== xdmp.getCurrentUser()) {
    options.userId = xdmp.user(user);
  }
  if (database) {
    options.database = xdmp.database(database);
  }
  return options;
}

export default {
  addMetadataToContent,
  buildInvokeOptionsForCustomHook,
  cleanData,
  createContentAsObject,
  createHeaders,
  createMetadata,
  determineDocumentType,
  getHeaders,
  getHeadersAsObject,
  getInstance,
  getInstanceAsObject,
  getTriples,
  getTriplesAsObject,
  isNonStringIterable,
  jsonToXml,
  makeCombinedOptions,
  makeEnvelope,
  mergeHeaders,
  normalizeTriple,
  normalizeValuesInNode,
  parseText,
  properExtensionURI,
  tripleToXml,
  updateHeaders,
  writeContentArray,
  xmlToJson
};
