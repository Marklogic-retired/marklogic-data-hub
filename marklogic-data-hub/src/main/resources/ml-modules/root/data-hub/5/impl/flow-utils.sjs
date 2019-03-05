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

class FlowUtils {
  constructor(config = null) {
    if (!config) {
      config = require("/com.marklogic.hub/config.sjs");
    }
    this.config = config;
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
   : Construct an envelope
   :
   : @param map - a map with all the stuff in it
   : @return - the newly constructed envelope
   */

  makeEnvelope(content, headers, triples, dataFormat) {
    content = this.cleanData(content, "content", dataFormat);
    headers = this.cleanData(headers, "headers", dataFormat);
    triples = this.cleanData(triples, "triples", dataFormat);
    let instance = null;
    if (dataFormat === consts.JSON) {
      if (content instanceof Object && content.hasOwnProperty("$type")) {
        instance = this.instanceToCanonicalJson(content);
        instance.info = {
          title: content['$type'],
          version: content['$version']
        };
      } else {
        instance = content;
      }

      let attachments = null;
      if (content instanceof Object && content.hasOwnProperty("$attachments")) {
        if (content['$attachments'] instanceof Element) {
          let config = json.config('custom');
          config['element-namespace'] = "http://marklogic.com/entity-services";
          attachments = json.transformToJson(this.cleanXMLforJSON(content['$attachments']), config);
        } else {
          attachments = content['$attachments'];
        }
      }

      return {
        envelope: {
          headers: headers,
          triples: triples,
          instance: instance,
          attachments: attachments
        }
      };
    } else if (dataFormat === consts.XML) {
      const nb = new NodeBuilder();
      nb.startDocument();
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
            nb.addNode(this.tripleToXml(triple));
          } else {
            nb.addNode(triple);
          }
        }
      } else if (triples) {
        if (triples instanceof sem.triple) {
          nb.addNode(this.tripleToXml(triples));
        } else {
          nb.addNode(triples);
        }
      }
      nb.endElement();

      nb.startElement("instance", "http://marklogic.com/entity-services");
      if (content instanceof Object && content.hasOwnProperty("$type")) {
        nb.startElement("info", "http://marklogic.com/entity-services");
        nb.startElement("title", "http://marklogic.com/entity-services");
        nb.addText(content["$type"]);
        nb.endElement();
        nb.startElement("version", "http://marklogic.com/entity-services");
        nb.addText(content["$version"]);
        nb.endElement();
        nb.endElement();
        let canonical = this.this.instanceToCanonicalXml(content);
        if (canonical) {
          nb.addNode(canonical);
        }
      } else if (content) {
        if (content instanceof Sequence) {
          for (let c of content) {
            nb.addNode(c);
          }
        } else if (this.isXmlNode(content)) {
          nb.addNode(content);
        } else {
          nb.addText(content.toString());
        }
      }
      nb.endElement();

      nb.startElement("attachments", "http://marklogic.com/entity-services");
      if (content instanceof Object && content.hasOwnProperty("$attachments")) {
        let attachments = content["$attachments"];
        if (attachments instanceof XMLDocument || this.isXmlNode(attachments)) {
          nb.addNode(attachments);
        } else {
          let config = json.config('custom');
          let cx = (config, 'attribute-names' , ('subKey' , 'boolKey' , 'empty'));
          nb.addNode(json.transformFromJson(attachments, config));
        }
      }
      nb.endElement();
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

    let kind = xdmp.nodeKind(resp);
    let isXml = (kind === 'element');
    if (!isXml) {
      // object with $type key is ES response type
      if (resp instanceof Object && resp.hasOwnProperty('$type')) {
        return resp;
      }
      else if (dataFormat === consts.XML) {
        return json.transformFromJson(resp, json.config("custom"));
      }
      else {
        return resp;
      }
    } else if (resp instanceof ArrayNode || resp instanceof Array) {
      if (dataFormat === consts.XML) {
        return json.arrayValues(resp);
      }
      else {
        return resp;
      }
    } else if (resp === null) {
      if (destination === "headers" && dataFormat === consts.JSON) {
        return {};
      }
      else if (destination === "triples" && dataFormat === consts.JSON) {
        return [];
      }
      else {
        return resp;
      }
    }

    if (dataFormat === consts.JSON &&
      destination === "triples") {
      return json.toArray(resp);
    }

    return resp;
  }

  isXmlNode(value) {
    return (value instanceof XMLNode && (value.nodeName !== null));
  }

  tripleToXml(triple) {
    let n = json.transformFromJson({trip: triple}, json.config("custom"));
    return fn.head(n).xpath('node()')
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

  instanceToCanonicalXml(entityInstance) {
    const nb = new NodeBuilder();
    nb.startDocument();
    nb.startElement(entityInstance['$type']);
    if (entityInstance['$ref']) {
      nb.addNode(entityInstance['$ref']);
    } else {
      for (let key in entityInstance) {
        if (xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'NCName', key) && key !== '$type') {
          let prop = entityInstance[key];
          if (prop instanceof Sequence) {
            for (let item of prop) {
              if (item instanceof ObjectNode) {
                this.instanceToCanonicalXml(item);
              } else {
                nb.startElement(key);
                if (item) {
                  nb.addNode(item);
                }
                nb.endElement();
              }
            }
          } else if (prop instanceof Array) {
            for (let item of prop) {
              if (item instanceof Object) {
                nb.startElement(key);
                nb.addAttribute('datatype', 'array');
                let canonical = this.instanceToCanonicalXml(item);
                if (canonical) {
                  nb.addNode(canonical);
                }
                nb.endElement();
              }
              else {
                nb.startElement(key);
                nb.addAttribute('datatype', 'array');
                if (item) {
                  nb.addNode(item);
                }
                nb.endElement();
              }
            }
          }
          else {
            nb.startElement(key);
            if(prop) {
              nb.addText(prop.toString());
            }
            nb.endElement();
          }
        }

      }
    }
    nb.endElement();
    nb.endDocument();
    return nb.toNode();
  }
}

module.exports = FlowUtils;
