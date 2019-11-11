/**
 Copyright 2012-2019 MarkLogic Corporation

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
const consts = require("/data-hub/5/impl/consts.sjs");
const json = require('/MarkLogic/json/json.xqy');
const sem = require("/MarkLogic/semantics.xqy");

class FlowUtils {
  constructor(config = null) {
    if (!config) {
      config = require("/com.marklogic.hub/config.sjs");
    }
    this.config = config;
    this.consts = consts;
  }


  /**
   : parse out invalid elements from json conversion, such as comments and PI
   :
   : @param input - the xml you want cleaned
   : @return - a copy of the xml without the bad elements
   */

  cleanXMLforJSON(input) {
    for(let node in input) {
      if(node instanceof Text){
        fn.replace(node,"<\?[^>]+\?>","")
      } else if(node instanceof Element){
      } else if(node instanceof Comment){
        return;
      } else if (node instanceof ProcessingInstruction){
        return;
      }else {
        return node;
      }
    }
  }

  /**
   : Determine the input document type from the root node.
   :
   : @param rootNode -
   : @return - a copy of the xml without the bad elements
   */

  determineDocumentType(input) {
    switch (input.nodeType) {
      case Node.OBJECT_NODE:
        return this.consts.JSON;
      case Node.ARRAY_NODE:
        return this.consts.JSON;
      case Node.ELEMENT_NODE:
        return this.consts.XML;
      case Node.TEXT_NODE:
        return this.consts.TEXT;
      case Node.BINARY_NODE:
        return this.consts.BINARY;
      case Node.BINARY_NODE:
        return this.consts.BINARY;
      default:
        return this.consts.DEFAULT_FORMAT;
    }
  }
  /**
   : Construct an envelope
   :
   : @param map - a map with all the stuff in it
   : @return - the newly constructed envelope
   */

  makeEnvelope(content, headers, triples, dataFormat) {
    content = this.cleanData(content, "content", dataFormat);
    headers = this.cleanData(this.normalizeValuesInNode(headers), "headers", dataFormat);
    triples = this.normalizeValuesInNode(triples);
    let instance = null;
    let attachments = null;
    let inputFormat = this.determineDocumentType(content);
    if (content instanceof Object && content.hasOwnProperty("$type")) {
      if (dataFormat === this.consts.JSON) {
        instance = this.instanceToCanonicalJson(content);
        instance.info = {
          title: content['$type'],
          version: content['$version']
        };
        if (content['$attachments'] && content['$attachments'] instanceof Element) {
          attachments =  this.xmlToJson(content['$attachments']);
        } else {
          attachments = content['$attachments'];
        }
      } else if (dataFormat === this.consts.XML) {
        instance = this.instanceToCanonicalXml(content);
        if ((!content['$attachments'] instanceof Element && !content['$attachments'] instanceof XMLDocument) && (content['$attachments'] instanceof Object || content['$attachments'] instanceof ObjectNode)) {
          attachments = this.jsonToXml(content['$attachments']);
        } else {
          attachments = content['$attachments'];
        }
      }
    } else if (inputFormat === dataFormat) {
      if(content instanceof Element &&  content.nodeName.toLowerCase() === 'root' && content.namespaceURI.toLowerCase() === ""){
        instance = Sequence.from(content.xpath('node()'));
      } else {
        if(content['$attachments']) {
          attachments = content['$attachments'];
          delete content['$attachments'];
        }
        instance = content;
      }
    } else {
      // cleanData has already changed the content body to the expected output
      instance = content;
    }

    if (dataFormat === this.consts.JSON) {
      if (this.isNonStringIterable(triples)) {
        let triplesAsArray = [];
        for (let triple of triples) {
          if (triple instanceof Sequence) {
            triplesAsArray = triplesAsArray.concat(triple.toArray());
          } else if (Array.isArray(triple)) {
            triplesAsArray = triplesAsArray.concat(triple);
          } else {
            triplesAsArray.push(triple);
          }
        }
        triples = triplesAsArray;
      }
      if(instance && instance.root) {
        instance = instance.root;
      }
      return {
        envelope: {
          headers: headers,
          triples: triples.map((triple) => this.normalizeTriple(triple).toObject()),
          instance: instance,
          attachments: attachments
        }
      };
    } else if (dataFormat === this.consts.XML) {
      const nb = new NodeBuilder();
      nb.startDocument();
      nb.startElement("envelope", "http://marklogic.com/entity-services");
      nb.startElement("headers", "http://marklogic.com/entity-services");
      if (this.isNonStringIterable(headers)) {
        for (let header of headers) {
          nb.addNode(header);
        }
      } else if (headers) {
        nb.addNode(headers);
      }
      nb.endElement();

      nb.startElement("triples", "http://marklogic.com/entity-services");
      if (this.isNonStringIterable(triples)) {
        for (let triple of triples) {
          nb.addNode(this.tripleToXml(this.normalizeTriple(triple)));
        }
      } else if (triples) {
        nb.addNode(this.tripleToXml(this.normalizeTriple(triples)));
      }
      nb.endElement();
      if(instance.nodeName === 'instance') {
        nb.addNode(instance);
      } else {
        nb.startElement("instance", "http://marklogic.com/entity-services");
        if (this.isNonStringIterable(instance)) {
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
          if (attachments instanceof XMLDocument || this.isXmlNode(attachments)) {
            nb.addNode(attachments);
          } else {
            let config = json.config('custom');
            let cx = (config, 'attribute-names' , ('subKey' , 'boolKey' , 'empty'));
            let xmlAttachments = json.transformFromJson(attachments, config);
            if(xmlAttachments instanceof Sequence){
                for(let xmlNode of xmlAttachments){
                  nb.addNode(xmlNode);
                }
            } else {
              nb.addNode(xmlAttachments);
            }
          }
        } else if (attachments instanceof XMLDocument || this.isXmlNode(attachments)) {
          nb.addNode(attachments);
        }
        nb.endElement();
      } else {
        nb.startElement("attachments", "http://marklogic.com/entity-services");
        nb.endElement();
      }
      nb.endElement();
      nb.endDocument();
      return nb.toNode();
    }

    fn.error(null, "RESTAPI-INVALIDCONTENT", Sequence.from(["Invalid data format: " + dataFormat + ".  Must be JSON or XML"]))
  };

  cleanData(resp, destination, dataFormat)
  {
    if (resp instanceof Document) {
      if (fn.count(resp.xpath('node()')) > 1) {
        fn.error(null, "DATAHUB-TOO-MANY-NODES", Sequence.from([400, "Too Many Nodes!. Return just 1 node"]));
      } else {
        resp = resp.xpath('node()');
      }
    }

    if (resp instanceof BinaryNode) {
      return xs.hexBinary(resp);
    }

    if (resp instanceof Sequence) {
      var cleanResp = [];
      for (const respPart of resp) {
        cleanResp.push(this.cleanData(respPart, destination, dataFormat));
      }
      return Sequence.from(cleanResp);
    }

    let kind = resp ? xdmp.nodeKind(resp) : null;
    let isXml = (kind === 'element');
    if (!isXml && resp) {
      // object with $type key is ES response type
      if (resp instanceof Object && resp.hasOwnProperty('$type')) {
        return resp;
      } else if (dataFormat === this.consts.XML) {
        const xmlResp = this.jsonToXml(resp);
        return xmlResp;
      } else {
        return resp;
      }
    } else if (isXml && resp) {
      if ((resp instanceof ArrayNode || resp instanceof Array) && dataFormat === this.consts.XML) {
        return this.cleanData(json.arrayValues(resp), destination, dataFormat);
      } else if (dataFormat === this.consts.JSON) {
        return this.xmlToJson(resp);
      } else {
        return resp;
      }
    } else if (!resp) {
      if (destination === "headers" && dataFormat === this.consts.JSON) {
        return {};
      }
      else if (destination === "triples" && dataFormat === this.consts.JSON) {
        return [];
      }
      else {
        return resp;
      }
    }

    if (dataFormat === this.consts.JSON &&
      destination === "triples") {
      return json.toArray(resp);
    }

    return resp;
  }

  isXmlNode(value) {
    return (value instanceof XMLNode && (value.nodeName !== null));
  }

  tripleToXml(triple) {
    return sem.rdfSerialize(triple, 'triplexml').xpath('*');
  }

  normalizeTriple(triple) {
    if (triple instanceof sem.triple) {
      return triple;
    } else if (triple instanceof ObjectNode) {
      return sem.triple(triple.toObject());
    } else {
      return sem.triple(triple);
    }
  }

  instanceToCanonicalJson(entityInstance) {
    let o;
    if (entityInstance['$ref']) {
      o = entityInstance['$ref'];
    }
    else {
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
                a.push(this.instanceToCanonicalJson(val));
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

  getElementName(ns, nsPrefix, name) {
    return ns && nsPrefix ? nsPrefix + ':' + name : name;
  }

  getElementNamespace(ns, nsPrefix) {
    return ns && nsPrefix ? ns : null;
  }


  instanceToCanonicalXml(entityInstance) {
    let namespace = entityInstance['$namespace'];
    let namespacePrefix = entityInstance['$namespacePrefix'];
    let typeName = entityInstance['$type'];
    let typeQName = this.getElementName(namespace, namespacePrefix, typeName);
    let ns = this.getElementNamespace(namespace, namespacePrefix);
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
          let nsKey = this.getElementName(namespace, namespacePrefix, key);
          let prop = entityInstance[key];
          let isArray = prop instanceof Array;
          if (isArray || prop instanceof Sequence) {
            for (let item of prop) {
              this.instanceItemToCanonicalXml(nb, item, nsKey, ns, isArray);
            }
          } else {
            this.instanceItemToCanonicalXml(nb, prop, nsKey, ns, false);
          }
        }
      }
    }
    nb.endElement();
    nb.endElement();
    return nb.toNode();
  }

  instanceItemToCanonicalXml(nb, item, nsKey, ns, isArray) {
    if (item instanceof Object && !(item instanceof xs.anyAtomicType)) {
      if (isArray) {
        nb.startElement(nsKey, ns);
        nb.addAttribute('datatype', 'array');
        let canonical = this.instanceToCanonicalXml(item);
        if (canonical) {
          nb.addNode(canonical);
        }
        nb.endElement();
      } else {
        // TODO the line below doesn't add to the node builder...
        // this.instanceToCanonicalXml(item);
      }
    } else {
      nb.startElement(nsKey, ns);
      if (isArray) {
        nb.addAttribute('datatype', 'array');
      }

      if (item instanceof Node) {
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

  xmlToJson(content) {
    let rootElementName = content.localName;
    let contentBody = this.xmlNodeToJson(content);
    return {
      [rootElementName]: contentBody
    };
  }

  xmlNodeToJson(content) {
    if (content && (content.hasChildNodes() || (content.attributes && content.attributes.length))) {
      let organizedOutput = {};
      let attributes = content.attributes;
      for (let i = 0; i < attributes.length; i++) {
        let childNode = attributes[i];
        organizedOutput[`@${childNode.localName}`] = organizedOutput[childNode.localName] || [];
        organizedOutput[`@${childNode.localName}`].push(this.xmlNodeToJson(childNode));
      }
      let childNodes = content.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        let childNode = childNodes[i];
        if (childNode instanceof Element) {
          organizedOutput[childNode.localName] = organizedOutput[childNode.localName] || [];
          organizedOutput[childNode.localName].push(this.xmlNodeToJson(childNode));
        } else {
          organizedOutput['$text'] = organizedOutput['$text'] || [];
          organizedOutput['$text'].push(this.xmlNodeToJson(childNode));
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
    } else if(fn.nilled(content)) {
      return null;
    } else {
      return fn.string(content);
    }
  }

  jsonToXml(content) {
    let contentInput = content;
    if (content instanceof ObjectNode || content instanceof ArrayNode) {
      contentInput = content.toObject();
    }
    if(contentInput instanceof Sequence){
      contentInput = contentInput.toArray();
    }
    let nb = new NodeBuilder().startElement('root');
    return  this.jsonToXmlNodeBuilder(contentInput, nb).endElement().toNode().xpath('node()');
  }

  jsonToXmlNodeBuilder(content, nb = new NodeBuilder()) {
    if (this.isNonStringIterable(content)) {
      for (const subContent of content) {
        this.jsonToXmlNodeBuilder(subContent, nb);
      }
    } else if (content instanceof xs.anyAtomicType) {
      nb.addText(fn.string(content));
    } else if (content instanceof Object) {
      for (const propName in content) {
        if (content.hasOwnProperty(propName)) {
          const propValues = content[propName];
          const elementName = (!xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "QName", propName)) ? xdmp.encodeForNCName(propName) : propName;
          if (propValues instanceof Array) {
            for (let propValueIndex in propValues) {
              if (propValues.hasOwnProperty(propValueIndex)) {
                nb.startElement(elementName);
                this.jsonToXmlNodeBuilder(propValues[propValueIndex], nb);
                nb.endElement();
              }
            }
          } else {
            nb.startElement(elementName);
            this.jsonToXmlNodeBuilder(propValues, nb);
            nb.endElement();
          }
        }
      }
    } else if (content instanceof Node) {
      nb.addNode(content);
    } else {
      nb.addText(fn.string(content));
    }
    return nb;
  }

  evalSubstituteVal(value) {
    let obj = this.consts.PROPERTY_KEY_MAP.get(value);
    if (obj === undefined) return value;
    if (obj == this.consts.CURRENT_DATE_TIME) {
      return fn.currentDateTime();
    } else if (obj == this.consts.CURRENT_USER) {
      return xdmp.getCurrentUser();
    }
    return value;
  }

  createAttachments(content, dataFormat) {
    let attachments = new NodeBuilder();
    attachments.startElement('attachments');
    attachments.addNode(this.cleanData(content.xpath('/*:envelope/*:instance'), "content", dataFormat));
    attachments.addNode(this.cleanData(content.xpath('/*:envelope/*:headers'), "headers", dataFormat));
    attachments.addNode(this.cleanData(content.xpath('/*:envelope/*:triples'), "triples", dataFormat));
    attachments.endElement();
    return attachments.toNode();
  }

  createHeaders(options) {
    let headers = {};
    for (let key in options.headers) {
      headers[key] = this.evalSubstituteVal(options.headers[key]);
    }
    if(options.file) {
        headers["createdUsingFile"] = options.file;
    }
    return headers;
  }

  mergeHeaders(headers, docHeaders, outputFormat) {
    if (outputFormat === this.consts.XML) {
      headers = this.cleanData(Sequence.from([
        docHeaders,
        this.jsonToXml(headers)
      ]), "headers", outputFormat);
    } else {
      let docHeadersArray = [];
      if (this.isNonStringIterable(docHeaders)) {
        for (let header of docHeaders) {
          if (header instanceof Element) {
            docHeadersArray.push(this.xmlToJson(header));
          } else {
            docHeadersArray.push(header);
          }
        }
      } else {
        if (docHeaders instanceof Element) {
          docHeadersArray.push(this.xmlToJson(docHeaders));
        } else {
          docHeadersArray.push(docHeaders);
        }
      }
      docHeaders = docHeadersArray.reduce((acc, cur) => Object.assign(acc,cur), {});
      headers = Object.assign({}, headers, docHeaders);
    }
    return headers;
  }

  createMetadata(metaData = {}, flowName, stepName, jobId) {
    if (!metaData) {
      metaData = {};
    }
    metaData[this.consts.CREATED_ON] = fn.string(this.evalSubstituteVal(this.consts.CREATED_ON));
    metaData[this.consts.CREATED_BY] = fn.string(this.evalSubstituteVal(this.consts.CREATED_BY));
    metaData[this.consts.CREATED_IN_FLOW] = flowName;
    metaData[this.consts.CREATED_BY_STEP] = stepName;
    metaData[this.consts.CREATED_BY_JOB] = fn.stringJoin(fn.distinctValues(Sequence.from([fn.tokenize(metaData[this.consts.CREATED_BY_JOB],"\\s+"),jobId])), " ");

    return metaData;
  }

  getInstanceAsObject(doc) {
    let instance = this.getInstance(doc);
    if(instance){
      instance = instance.toObject();
    }
    return instance;
  }

  getInstance(doc) {
    let instance = fn.head(doc.xpath('/*:envelope/*:instance'));
    if(fn.count(instance) === 0) {
      instance = null;
    }
    return instance;
  }

  getHeadersAsObject(doc) {
    let headers = this.getHeaders(doc);
    if(headers){
      headers = headers.toObject();
    }
    return headers;
  }

  getHeaders(doc) {
    let headers = fn.head(doc.xpath('/*:envelope/*:headers'));
    if (fn.count(headers) === 0) {
      headers = null;
    } else if (fn.count(fn.head(doc.xpath('/*:envelope/*:headers/*'))) === 0) {
      headers = null;
    }
    return headers;
  }

  normalizeValuesInNode(node) {
    if (node instanceof ObjectNode || node instanceof ArrayNode) {
      return node.toObject();
    } else if (node instanceof Element) {
      return node.xpath('*');
    }
    return node;
  }

  getTriplesAsObject(doc) {
    let triples = this.getTriples(doc);
    if(triples){
      triples = triples.toObject();
    }
    return triples;
  }

  getTriples(doc) {
    let triples = fn.head(doc.xpath('/*:envelope/(*:triples[self::element()]|array-node("triples"))'));
    if (fn.count(triples) === 0) {
      triples = null;
    }
    else if (fn.count(fn.head(doc.xpath('/*:envelope/*:triples/*'))) === 0) {
      triples = null;
    }
    return triples;
  }

  createContentAsObject() {
    return {
      triples : [],
      headers: {},
      instance: {}
    };
  }

  parseText(text, outputFormat){
    try {
      let options = "format-json";
      if(outputFormat === datahub.flow.consts.XML) {
        options = "format-xml";
      }
      return fn.head(xdmp.unquote(instance, null, options));
    }
    catch (e) {
      let errMsg = 'The input text document is not a valid ' + outputFormat + ' .';
      datahub.debug.log({message: errMsg, type: 'error'});
      throw Error(errMsg);
    }
  }

  isNonStringIterable(obj) {
    if (!obj || typeof obj === 'string') {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }
}

module.exports = FlowUtils;
